<?php

namespace App\Services;

use App\Models\CashTransaction;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Setting;
use App\Models\StockMovement;
use Exception;
use Illuminate\Support\Facades\DB;

class PosService
{
    /**
     * Complete POS Checkout with DB Transaction and Row Locking.
     */
    public function processCheckout(array $data, int $userId): Sale
    {
        return DB::transaction(function () use ($data, $userId) {
            $items = $data['items'] ?? [];
            if (empty($items)) {
                throw new Exception('কার্ট খালি! কোনো পণ্য নির্বাচন করা হয়নি।');
            }

            // 1. Generate unique invoice number
            $today = date('Ymd');
            $lastSaleToday = Sale::whereDate('created_at', today())->latest('id')->first();
            $seq = $lastSaleToday ? ((int) substr($lastSaleToday->invoice_number, -4)) + 1 : 1;
            $invoiceNumber = 'INV-' . $today . '-' . str_pad($seq, 4, '0', STR_PAD_LEFT);

            // 2. Resolve Customer
            $customerId = $data['customer_id'] ?? null;
            $customerName = 'Walk-in Customer';
            $customerPhone = null;
            $customer = null;

            if ($customerId) {
                $customer = Customer::lockForUpdate()->find($customerId);
                if ($customer) {
                    $customerName = $customer->name;
                    $customerPhone = $customer->phone;
                }
            } else {
                $customerName = $data['customer_name'] ?? 'ওয়াক-ইন কাস্টমার (Walk-in)';
                $customerPhone = $data['customer_phone'] ?? null;
            }

            // 3. Process items with row locking & stock validation
            $subtotal = 0;
            $totalCost = 0;
            $productDiscountTotal = 0;
            $totalTax = 0;
            $processedItems = [];

            foreach ($items as $item) {
                $productId = $item['product_id'];
                $qty = (float) $item['quantity'];

                if ($qty <= 0) {
                    throw new Exception('পণ্যের পরিমাণ অবশ্যই শূন্যের চেয়ে বেশি হতে হবে।');
                }

                // Row-lock product to avoid race condition
                $product = Product::lockForUpdate()->find($productId);
                if (!$product) {
                    throw new Exception("পণ্যটি পাওয়া যায়নি (ID: {$productId})");
                }

                $allowNegativeStock = (bool) Setting::get('allow_negative_stock', false);
                if (!$allowNegativeStock && $product->current_stock < $qty) {
                    throw new Exception("অপর্যাপ্ত স্টক: '{$product->name}' এর বর্তমান স্টক {$product->current_stock} {$product->unit->name_bn} কিন্তু চাওয়া হয়েছে {$qty} {$product->unit->name_bn}!");
                }

                $unitPrice = (float) ($item['unit_price'] ?? $product->selling_price);
                $purchaseCost = (float) $product->purchase_price;
                $itemDiscount = (float) ($item['discount_amount'] ?? 0);
                $itemSubtotal = ($unitPrice * $qty) - $itemDiscount;
                
                // Item tax
                $taxPercent = (float) ($product->tax_percent ?? 0);
                $itemTax = ($itemSubtotal * $taxPercent) / 100;

                $itemTotal = $itemSubtotal + $itemTax;

                $subtotal += ($unitPrice * $qty);
                $productDiscountTotal += $itemDiscount;
                $totalTax += $itemTax;
                $totalCost += ($purchaseCost * $qty);

                $processedItems[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'purchase_cost' => $purchaseCost,
                    'unit_price' => $unitPrice,
                    'discount_type' => $item['discount_type'] ?? 'fixed',
                    'discount_amount' => $itemDiscount,
                    'subtotal' => $itemSubtotal,
                    'tax_amount' => $itemTax,
                    'total' => $itemTotal,
                ];
            }

            // 4. Order Level Discount & Tax
            $orderDiscountType = $data['discount_type'] ?? 'fixed';
            $orderDiscountRate = (float) ($data['discount_rate'] ?? 0);
            $orderDiscountAmount = (float) ($data['discount_amount'] ?? 0);

            if ($orderDiscountType === 'percentage' && $orderDiscountRate > 0) {
                $orderDiscountAmount = ($subtotal * $orderDiscountRate) / 100;
            }

            $grandTotal = max(0, ($subtotal - $productDiscountTotal - $orderDiscountAmount) + $totalTax);
            $totalProfit = $grandTotal - $totalTax - $totalCost;

            // 5. Payments
            $paidAmount = (float) ($data['paid_amount'] ?? $grandTotal);
            $paymentMethod = $data['payment_method'] ?? 'cash';
            $payments = $data['payments'] ?? [
                [
                    'payment_method' => $paymentMethod,
                    'amount' => $paidAmount,
                    'transaction_reference' => $data['transaction_reference'] ?? null,
                ]
            ];

            $totalPaid = 0;
            foreach ($payments as $p) {
                $totalPaid += (float) ($p['amount'] ?? 0);
            }

            $dueAmount = 0;
            $changeAmount = 0;

            if ($totalPaid >= $grandTotal) {
                $changeAmount = $totalPaid - $grandTotal;
                $actualPaid = $grandTotal;
                $paymentStatus = 'paid';
            } elseif ($totalPaid > 0) {
                $dueAmount = $grandTotal - $totalPaid;
                $actualPaid = $totalPaid;
                $paymentStatus = 'partial';
            } else {
                $dueAmount = $grandTotal;
                $actualPaid = 0;
                $paymentStatus = 'due';
            }

            // 6. Create Sale
            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'customer_id' => $customerId,
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'user_id' => $userId,
                'sale_date' => now(),
                'total_items' => count($processedItems),
                'subtotal' => $subtotal,
                'product_discount_total' => $productDiscountTotal,
                'order_discount_type' => $orderDiscountType,
                'order_discount_rate' => $orderDiscountRate,
                'order_discount_amount' => $orderDiscountAmount,
                'tax_rate' => 0,
                'tax_amount' => $totalTax,
                'grand_total' => $grandTotal,
                'total_cost' => $totalCost,
                'total_profit' => $totalProfit,
                'paid_amount' => $actualPaid,
                'change_amount' => $changeAmount,
                'due_amount' => $dueAmount,
                'payment_status' => $paymentStatus,
                'sale_status' => 'completed',
                'notes' => $data['notes'] ?? null,
            ]);

            // 7. Save Sale Items, Update Stock, Create Stock Movements
            foreach ($processedItems as $itemInfo) {
                /** @var Product $product */
                $product = $itemInfo['product'];
                $qty = $itemInfo['quantity'];

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_code' => $product->barcode,
                    'quantity' => $qty,
                    'purchase_cost' => $itemInfo['purchase_cost'],
                    'unit_price' => $itemInfo['unit_price'],
                    'discount_type' => $itemInfo['discount_type'],
                    'discount_amount' => $itemInfo['discount_amount'],
                    'subtotal' => $itemInfo['subtotal'],
                    'tax_amount' => $itemInfo['tax_amount'],
                    'total' => $itemInfo['total'],
                ]);

                // Stock update
                $stockBefore = $product->current_stock;
                $stockAfter = $stockBefore - $qty;
                $product->update(['current_stock' => $stockAfter]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'movement_type' => 'sale',
                    'reference_type' => Sale::class,
                    'reference_id' => $sale->id,
                    'user_id' => $userId,
                    'quantity' => -$qty,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'unit_cost' => $product->purchase_price,
                    'reason' => "বিক্রয় চালান #{$invoiceNumber}",
                ]);
            }

            // 8. Record Payments
            $payIndex = 1;
            foreach ($payments as $pay) {
                $payAmount = (float) ($pay['amount'] ?? 0);
                if ($payAmount <= 0) continue;

                $paymentNumber = 'SPAY-' . $today . '-' . str_pad($sale->id * 10 + $payIndex, 5, '0', STR_PAD_LEFT);
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'customer_id' => $customerId,
                    'user_id' => $userId,
                    'payment_number' => $paymentNumber,
                    'payment_date' => now(),
                    'payment_method' => $pay['payment_method'] ?? 'cash',
                    'amount' => min($payAmount, $actualPaid),
                    'transaction_reference' => $pay['transaction_reference'] ?? null,
                    'note' => $pay['note'] ?? 'পিওএস বিক্রয় কাউন্টার পেমেন্ট',
                ]);

                // Cash Transaction Log for register
                CashTransaction::create([
                    'transaction_number' => 'CT-' . $today . '-' . uniqid(),
                    'user_id' => $userId,
                    'transaction_type' => 'in',
                    'category' => 'sales',
                    'reference_type' => Sale::class,
                    'reference_id' => $sale->id,
                    'amount' => min($payAmount, $actualPaid),
                    'balance_after' => 0,
                    'payment_method' => $pay['payment_method'] ?? 'cash',
                    'description' => "পিওএস বিক্রয় চালান #{$invoiceNumber}",
                    'transaction_date' => now(),
                ]);

                $payIndex++;
            }

            // 9. Update Customer Due Balance if not walk-in
            if ($customer && $dueAmount > 0) {
                $customer->increment('current_balance', $dueAmount);
            }

            return $sale->load(['items.product', 'payments', 'customer', 'user']);
        });
    }
}

