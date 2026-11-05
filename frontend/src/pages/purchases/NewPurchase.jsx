import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  DollarSign,
} from 'lucide-react';
import api from '../../services/api';

export const NewPurchase = () => {
  const { t, formatCurrency } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [supplierId, setSupplierId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { product_id: '', quantity: 10, unit_cost: 0 },
  ]);
  const [discountAmount, setDiscountAmount] = useState('0');
  const [taxAmount, setTaxAmount] = useState('0');
  const [shippingCost, setShippingCost] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, prodRes] = await Promise.all([
          api.get('/suppliers'),
          api.get('/products?per_page=1000'),
        ]);
        setSuppliers(supRes.data.data || supRes.data || []);
        setProducts(prodRes.data.data || prodRes.data || []);
      } catch (e) {
        error('সাপ্লায়ার ও পণ্য ডেটা লোড করতে ব্যর্থ হয়েছে।');
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      // Auto fill purchase price if product chosen
      if (field === 'product_id') {
        const prod = products.find((p) => p.id === Number(value));
        if (prod) {
          updated[index].unit_cost = Number(prod.purchase_price) || 0;
        }
      }
      return updated;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { product_id: '', quantity: 1, unit_cost: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unit_cost) || 0),
    0
  );
  const grandTotal = Math.max(
    0,
    subtotal - (Number(discountAmount) || 0) + (Number(taxAmount) || 0) + (Number(shippingCost) || 0)
  );
  const dueAmount = Math.max(0, grandTotal - (Number(paidAmount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
      error('অনুগ্রহ করে একজন সরবরাহকারী নির্বাচন করুন।');
      return;
    }

    const validItems = items.filter((it) => it.product_id && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      error('অনুগ্রহ করে অন্তত একটি সঠিক পণ্য যোগ করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/purchases', {
        supplier_id: supplierId,
        purchase_date: purchaseDate,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          quantity: Number(it.quantity),
          unit_cost: Number(it.unit_cost),
        })),
        discount_amount: Number(discountAmount) || 0,
        tax_amount: Number(taxAmount) || 0,
        shipping_cost: Number(shippingCost) || 0,
        paid_amount: Number(paidAmount) || 0,
        payment_method: paymentMethod,
        notes,
      });

      success('নতুন ক্রয় চালান সফলভাবে তৈরি হয়েছে এবং স্টক বৃদ্ধি করা হয়েছে!');
      navigate('/purchases');
    } catch (err) {
      error(err.response?.data?.message || 'ক্রয় সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/purchases"
          className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('newPurchase')}
          </h1>
          <p className="text-xs text-slate-500">সরবরাহকারীর থেকে পাইকারি পণ্য ক্রয়ের বিল তৈরি ও স্টক ইন</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">সরবরাহকারী নির্বাচন *</label>
            <select
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">সরবরাহকারী বেছে নিন</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.company_name})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ক্রয় তারিখ *</label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        {/* Dynamic Items Rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ক্রয়কৃত পণ্যসমূহের তালিকা</span>
            <button
              type="button"
              onClick={addItemRow}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>আইটেম যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex-1">
                  <select
                    required
                    value={row.product_id}
                    onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">পণ্য নির্বাচন করুন</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.barcode})</option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="পরিমাণ"
                    value={row.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full py-2 px-2 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="w-28">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="একক দর ৳"
                    value={row.unit_cost}
                    onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                    className="w-full py-2 px-2 text-right rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="w-28 text-right font-black text-indigo-600">
                  {formatCurrency((Number(row.quantity) || 0) * (Number(row.unit_cost) || 0))}
                </div>

                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  disabled={items.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">নোট / মেমো তথ্য</label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="সাপ্লায়ার ইনভয়েস নম্বর বা ডেলিভারি নোট..."
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>উপমোট (Subtotal):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">ছাড় (Discount ৳):</span>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-24 py-1 px-2 text-right rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">ভ্যাট / ট্যাক্স (৳):</span>
              <input
                type="number"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                className="w-24 py-1 px-2 text-right rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">পরিবহন খরচ (৳):</span>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-24 py-1 px-2 text-right rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>সর্বমোট বিল:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Paid Amount */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">পরিশোধিত টাকা (Paid ৳):</span>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-28 py-1.5 px-2 text-right text-sm rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 font-bold text-emerald-700 dark:text-emerald-300"
              />
            </div>

            {dueAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>সরবরাহকারীর দেনা থাকবে:</span>
                <span>{formatCurrency(dueAmount)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link
            to="/purchases"
            className="py-2.5 px-5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'ক্রয় সম্পন্ন ও স্টক যুক্ত করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

