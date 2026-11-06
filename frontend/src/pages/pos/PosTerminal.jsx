import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Barcode,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Phone,
  CreditCard,
  Printer,
  CheckCircle2,
  Check,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Percent,
  X,
  FileText,
  Sparkles,
  Zap,
  Tag,
  Coins,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Package,
  Eye,
  LayoutGrid,
  List,
  ChevronDown,
  Scale,
} from 'lucide-react';
import api from '../../services/api';
import { playBarcodeBeep, playCheckoutSuccessSound } from '../../utils/sound';
import { normalizeImageUrl } from '../../utils/imageHelper';
import { BarcodeSvg } from '../../components/common/BarcodeSvg';
import { ProductCardMedia, getCategoryTheme } from '../../components/common/ProductCardMedia';

export const PosTerminal = () => {
  const navigate = useNavigate();
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { success, error, warning } = useToast();

  const [categories, setCategories] = useState(() => {
    try {
      const saved = sessionStorage.getItem('israfil_pos_categories_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = sessionStorage.getItem('israfil_pos_customers_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [products, setProducts] = useState(() => {
    try {
      const saved = sessionStorage.getItem('israfil_pos_products_cache');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(() => {
    try {
      const saved = sessionStorage.getItem('israfil_pos_products_cache');
      return !saved || JSON.parse(saved).length === 0;
    } catch (e) {
      return true;
    }
  });

  // Ref to catalog grid/list scroll container for preserving scroll position
  const catalogScrollRef = useRef(null);

  // View Mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('israfil_pos_view_mode') || 'grid';
    } catch (e) {
      return 'grid';
    }
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('israfil_pos_view_mode', mode);
    } catch (e) { }
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    try {
      sessionStorage.setItem('israfil_pos_catalog_scroll', '0');
    } catch (e) {}
    if (catalogScrollRef.current) {
      catalogScrollRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    try {
      sessionStorage.removeItem('israfil_pos_search');
      sessionStorage.removeItem('israfil_pos_selected_cat');
    } catch (e) {}
  }, []);

  const handleSearchChange = (val) => {
    setProductSearch(val);
    try {
      sessionStorage.removeItem('israfil_pos_search');
      sessionStorage.setItem('israfil_pos_catalog_scroll', '0');
    } catch (e) {}
    if (catalogScrollRef.current) {
      catalogScrollRef.current.scrollTop = 0;
    }
  };

  // More Categories Popover State
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const moreCategoriesRef = useRef(null);

  // Card Stepper Quantities map for products not yet in cart
  const [cardQuantities, setCardQuantities] = useState({});

  const formatUnitDisplay = (unit, measurementValue) => {
    if (!unit) return lang === 'bn' ? 'পিস (pcs)' : 'Piece (pcs)';
    const name = lang === 'bn' ? (unit.name_bn || unit.name) : unit.name;
    const code = unit.code ? `(${unit.code})` : '';
    const val = measurementValue ? `${measurementValue} ` : '';
    return `${val}${name} ${code}`.trim();
  };

  const getCardQty = (prodId) => {
    const inCart = cart.find((it) => it.product_id === prodId);
    if (inCart) return inCart.quantity;
    return cardQuantities[prodId] || 1;
  };

  const handleCardMinus = (e, prod) => {
    e.stopPropagation();
    const inCart = cart.find((it) => it.product_id === prod.id);
    if (inCart) {
      updateQuantity(prod.id, -1);
    } else {
      setCardQuantities((prev) => ({
        ...prev,
        [prod.id]: Math.max(1, (prev[prod.id] || 1) - 1),
      }));
    }
  };

  const handleCardPlus = (e, prod) => {
    e.stopPropagation();
    const inCart = cart.find((it) => it.product_id === prod.id);
    if (inCart) {
      updateQuantity(prod.id, 1);
    } else {
      setCardQuantities((prev) => ({
        ...prev,
        [prod.id]: (prev[prod.id] || 1) + 1,
      }));
    }
  };

  const handleCardAdd = (e, prod) => {
    e.stopPropagation();
    const inCart = cart.find((it) => it.product_id === prod.id);
    if (inCart) {
      addToCart(prod, 1);
    } else {
      const qty = cardQuantities[prod.id] || 1;
      addToCart(prod, qty);
      setCardQuantities((prev) => ({ ...prev, [prod.id]: 1 }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreCategoriesRef.current && !moreCategoriesRef.current.contains(e.target)) {
        setShowMoreCategories(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cart State (Persisted in sessionStorage so cashier never loses cart when checking product details)
  const [cart, setCart] = useState(() => {
    try {
      const saved = sessionStorage.getItem('israfil_pos_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    try {
      // Only retain phone if there is an active unsaved cart in the session
      const savedCart = sessionStorage.getItem('israfil_pos_cart');
      if (savedCart && JSON.parse(savedCart).length > 0) {
        return (
          sessionStorage.getItem('israfil_pos_customer_phone') ||
          sessionStorage.getItem('israfil_pos_walkin_phone') ||
          ''
        );
      }
      return '';
    } catch (e) {
      return '';
    }
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [txReference, setTxReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);

  // Auto-detect registered membership customer by phone (or exact name match)
  const matchedCustomer = customerPhone.trim()
    ? customers.find((c) => {
        const cleanInput = customerPhone.replace(/\D/g, '');
        const cPhone = String(c.phone || '').replace(/\D/g, '');
        if (cleanInput.length >= 6 && cPhone.includes(cleanInput)) return true;
        if (c.phone && c.phone.trim() === customerPhone.trim()) return true;
        return c.name && c.name.toLowerCase().trim() === customerPhone.trim().toLowerCase();
      })
    : null;

  // Reset point redemption if customer changes
  useEffect(() => {
    setIsRedeemingPoints(false);
  }, [customerPhone]);

  // Live remote customer search if customer phone/name is not in preloaded 200 pool
  useEffect(() => {
    const trimmed = customerPhone.trim();
    const cleanDigits = trimmed.replace(/\D/g, '');
    if ((cleanDigits.length >= 6 || trimmed.length >= 4) && !matchedCustomer) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.get(`/customers?search=${encodeURIComponent(trimmed)}&per_page=5`);
          const foundList = res.data?.data || [];
          if (foundList.length > 0) {
            setCustomers((prev) => {
              const existingIds = new Set(prev.map((c) => c.id));
              const newItems = foundList.filter((c) => !existingIds.has(c.id));
              return newItems.length > 0 ? [...prev, ...newItems] : prev;
            });
          }
        } catch (e) {
          // ignore lookup errors
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [customerPhone, matchedCustomer]);

  // Sync cart & customer phone to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('israfil_pos_cart', JSON.stringify(cart));
    } catch (e) { }
  }, [cart]);

  useEffect(() => {
    try {
      sessionStorage.setItem('israfil_pos_customer_phone', customerPhone);
    } catch (e) { }
  }, [customerPhone]);

  // Completed Checkout State
  const [completedSale, setCompletedSale] = useState(null);
  const [receiptFormat, setReceiptFormat] = useState('80mm'); // '80mm', '58mm', 'a4'
  const [shopSettings, setShopSettings] = useState({});

  const barcodeInputRef = useRef(null);
  const categoryScrollRef = useRef(null);

  // Global Keyboard Shortcut Action Listeners for POS
  useEffect(() => {
    const handleFocusBarcode = () => {
      barcodeInputRef.current?.focus();
      barcodeInputRef.current?.select();
    };

    const handleClearCart = () => {
      clearCart();
    };

    window.addEventListener('pos:focus-barcode', handleFocusBarcode);
    window.addEventListener('pos:clear-cart', handleClearCart);
    return () => {
      window.removeEventListener('pos:focus-barcode', handleFocusBarcode);
      window.removeEventListener('pos:clear-cart', handleClearCart);
    };
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [lang]);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/pos/data');
      const loadedCustomers = res.data.customers || [];
      const loadedCategories = res.data.categories || [];
      const rawProducts = res.data.products;
      const loadedProducts = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);

      setCategories(loadedCategories);
      setCustomers(loadedCustomers);
      setProducts(loadedProducts);

      // Persist POS cache safely in sessionStorage without overflowing quota
      try {
        sessionStorage.setItem('israfil_pos_customers_cache', JSON.stringify(loadedCustomers));
        sessionStorage.setItem('israfil_pos_categories_cache', JSON.stringify(loadedCategories));
        const prodJson = JSON.stringify(loadedProducts);
        // Only cache in sessionStorage if within safe browser storage size (<1.5MB)
        if (prodJson.length < 1500000) {
          sessionStorage.setItem('israfil_pos_products_cache', prodJson);
        }
      } catch (e) {}

      if (res.data.shop_settings) {
        setShopSettings(res.data.shop_settings);
        if (res.data.shop_settings.default_printer_type) {
          setReceiptFormat(res.data.shop_settings.default_printer_type);
        }
      }

      // Restore previously selected customer from session if any
      try {
        const savedCustId = sessionStorage.getItem('israfil_pos_cust_id');
        if (savedCustId) {
          const found = loadedCustomers.find((c) => c.id === Number(savedCustId));
          if (found) setSelectedCustomer(found);
        }
      } catch (e) { }
    } catch (err) {
      error(lang === 'bn' ? 'পিওএস ডেটা লোড করতে সমস্যা হয়েছে।' : 'Failed to load POS data.');
    } finally {
      setLoading(false);
      setTimeout(() => barcodeInputRef.current?.focus(), 250);
    }
  };

  // Restore POS product catalog scroll position when products are mounted/filtered
  useEffect(() => {
    if (products.length > 0 && catalogScrollRef.current) {
      const savedScroll = Number(sessionStorage.getItem('israfil_pos_catalog_scroll') || 0);
      if (savedScroll > 0) {
        catalogScrollRef.current.scrollTop = savedScroll;
        requestAnimationFrame(() => {
          if (catalogScrollRef.current) {
            catalogScrollRef.current.scrollTop = savedScroll;
          }
        });
      }
    }
  }, [products.length, viewMode]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  // Barcode Instant Lookup / Scanning (USB/Bluetooth scanner triggers Enter)
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      const res = await api.get(`/products/barcode/${encodeURIComponent(code)}`);
      addToCart(res.data);
      playBarcodeBeep(0.3);
      setBarcodeInput('');
    } catch (err) {
      error(
        lang === 'bn'
          ? `বারকোড '${code}' যুক্ত কোনো পণ্য পাওয়া যায়নি!`
          : `No product found with barcode '${code}'!`
      );
      setBarcodeInput('');
    }
  };

  // Helper to extract product discount info (configured during Add/Edit Product)
  const getProductDiscountInfo = (product) => {
    const sp = Number(product.selling_price) || 0;
    const type = product.discount_type;
    const val = Number(product.discount_value) || 0;
    if (!type || type === 'none' || val <= 0) {
      return { hasDiscount: false, discountAmount: 0, finalPrice: sp, badge: null };
    }
    let discountAmt = 0;
    let badge = '';
    if (type === 'percentage') {
      discountAmt = (sp * val) / 100;
      badge = `-${val}%`;
    } else {
      discountAmt = Math.min(sp, val);
      badge = `-৳${val}`;
    }
    return {
      hasDiscount: true,
      discountAmount: discountAmt,
      finalPrice: Math.max(0, sp - discountAmt),
      badge,
      type,
      rate: val,
    };
  };

  // Cart Operations
  const addToCart = (product, qtyToAdd = 1) => {
    const qty = Math.max(1, parseInt(qtyToAdd, 10) || 1);
    if (Number(product.current_stock) <= 0) {
      warning(
        lang === 'bn'
          ? `সতর্কতা: '${product.name}' এর বর্তমান স্টক শূন্য!`
          : `Warning: '${product.name}' is currently out of stock!`
      );
    }

    const discountInfo = getProductDiscountInfo(product);
    const unitDiscount = discountInfo.discountAmount;

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (Number(product.current_stock) <= existing.quantity) {
          warning(
            lang === 'bn'
              ? `'${product.name}' এর অবশিষ্ট স্টক সীমিত (${product.current_stock})`
              : `Limited stock remaining for '${product.name}' (${product.current_stock})`
          );
        }
        const newQty = existing.quantity + qty;
        const newDiscountAmt = (existing.unit_discount || 0) * newQty;
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: newQty, discount_amount: newDiscountAmt }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            name_bn: product.name_bn,
            barcode: product.barcode,
            unit_price: Number(product.selling_price),
            purchase_price: Number(product.purchase_price),
            tax_percent: Number(product.tax_percent || 0),
            unit: lang === 'bn' ? (product.unit?.name_bn || 'পিস') : (product.unit?.name || 'pcs'),
            quantity: qty,
            discount_type: product.discount_type || 'fixed',
            discount_value: Number(product.discount_value) || 0,
            unit_discount: unitDiscount,
            discount_amount: unitDiscount * qty,
            has_discount: discountInfo.hasDiscount,
            discount_badge: discountInfo.badge,
            current_stock: Number(product.current_stock),
            image_url: product.image_url,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const newDiscountAmt = (item.unit_discount || 0) * newQty;
            return { ...item, quantity: newQty, discount_amount: newDiscountAmt };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const setExplicitQuantity = (productId, qty) => {
    const parsed = Math.max(1, parseInt(qty, 10) || 1);
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          const newDiscountAmt = (item.unit_discount || 0) * parsed;
          return { ...item, quantity: parsed, discount_amount: newDiscountAmt };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerPhone('');
    setTenderedAmount('');
    setTxReference('');
    setIsRedeemingPoints(false);
    try {
      sessionStorage.removeItem('israfil_pos_cart');
      sessionStorage.removeItem('israfil_pos_customer_phone');
      sessionStorage.removeItem('israfil_pos_walkin_phone');
      sessionStorage.removeItem('israfil_pos_cust_id');
    } catch (e) { }
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // Financial Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const totalItemDiscount = cart.reduce((acc, item) => acc + (item.discount_amount || 0), 0);
  const totalTax = cart.reduce(
    (acc, item) =>
      acc + (((item.unit_price * item.quantity) - (item.discount_amount || 0)) * item.tax_percent) / 100,
    0
  );

  // VIP Customer Loyalty Points Calculation (100 pts = 75 BDT, 0.75 BDT / pt)
  // Minimum 100 points required to be eligible for redemption
  const maxPayable = Math.max(0, subtotal - totalItemDiscount);
  const availablePoints = matchedCustomer ? Number(matchedCustomer.loyalty_points || 0) : 0;
  const isEligibleForRedemption = availablePoints >= 100;
  const maxPointsNeeded = Math.ceil(maxPayable / 0.75);
  const effectiveRedeemPoints = (isRedeemingPoints && isEligibleForRedemption) ? Math.min(availablePoints, maxPointsNeeded) : 0;
  const pointsDiscountAmount = (isRedeemingPoints && isEligibleForRedemption) ? Math.min(maxPayable, Number((effectiveRedeemPoints * 0.75).toFixed(2))) : 0;

  const grandTotal = Math.max(0, Number((subtotal - totalItemDiscount - pointsDiscountAmount + totalTax).toFixed(2)));
  const numericTendered = tenderedAmount === '' ? grandTotal : Number(tenderedAmount);
  const changeAmount = Math.max(0, numericTendered - grandTotal);
  const dueAmount = Math.max(0, grandTotal - numericTendered);

  // Quick Cash amount helper
  const addQuickCash = (amount) => {
    if (amount === 'exact') {
      setTenderedAmount(grandTotal.toString());
    } else {
      const current = Number(tenderedAmount) || 0;
      setTenderedAmount((current + amount).toString());
    }
  };

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      error(lang === 'bn' ? 'কার্ট খালি! অনুগ্রহ করে পণ্য যুক্ত করুন।' : 'Cart is empty! Please add products.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_id: matchedCustomer?.id || null,
        customer_name: matchedCustomer
          ? matchedCustomer.name
          : (customerPhone.trim()
              ? (lang === 'bn' ? `ক্রেতা (${customerPhone.trim()})` : `Customer (${customerPhone.trim()})`)
              : (lang === 'bn' ? 'ওয়াক-ইন কাস্টমার' : 'Walk-in Customer')),
        customer_phone: customerPhone.trim() || null,
        redeem_points: effectiveRedeemPoints,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_type: item.discount_type || 'fixed',
          discount_amount: item.discount_amount || 0,
        })),
        paid_amount: numericTendered,
        payment_method: paymentMethod,
        transaction_reference: txReference,
      };

      const res = await api.post('/pos/checkout', payload);
      setCompletedSale(res.data.sale);
      if (res.data.shop_settings) {
        setShopSettings(res.data.shop_settings);
      }
      if (matchedCustomer && res.data.sale?.customer_points_balance !== undefined) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === matchedCustomer.id
              ? { ...c, loyalty_points: res.data.sale.customer_points_balance }
              : c
          )
        );
      }
      playCheckoutSuccessSound(0.35);
      success(t('invoiceSuccess'));
      clearCart();
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'চেকআউট সম্পন্ন করতে সমস্যা হয়েছে।' : 'Failed to complete checkout.');
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchesSearch = productSearch
      ? p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.barcode.includes(productSearch) ||
      (p.name_bn && p.name_bn.includes(productSearch))
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-3">
      {/* If completed sale, show Dedicated Success & Print Screen */}
      {completedSale ? (
        <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('invoiceSuccess')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'চালান নম্বর: ' : 'Invoice #: '}
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {completedSale.invoice_number}
              </span>
            </p>
          </div>

          {/* Invoice Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'bn' ? 'ক্রেতা:' : 'Customer:'}</span>
              <span className="font-semibold">{completedSale.customer_name}</span>
            </div>
            {completedSale.customer_phone && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">{lang === 'bn' ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                <span className="font-mono">{completedSale.customer_phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'bn' ? 'মোট আইটেম:' : 'Total Items:'}</span>
              <span className="font-semibold">{completedSale.total_items} {lang === 'bn' ? 'টি' : 'items'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'bn' ? 'উপমোট মূল্য:' : 'Subtotal:'}</span>
              <span className="font-semibold">{formatCurrency(completedSale.subtotal)}</span>
            </div>

            {/* Total Discount Received Highlight Badge */}
            {((Number(completedSale.points_discount_amount || 0) + Number(completedSale.product_discount_total || 0) + Number(completedSale.order_discount_amount || 0)) > 0) && (
              <div className="flex justify-between items-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {lang === 'bn' ? 'সর্বমোট প্রাপ্ত ছাড় (Total Discount):' : 'Total Discount Received:'}
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(Number(completedSale.points_discount_amount || 0) + Number(completedSale.product_discount_total || 0) + Number(completedSale.order_discount_amount || 0))}
                </span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>{lang === 'bn' ? 'সর্বমোট মূল্য (Grand Total):' : 'Grand Total:'}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">{formatCurrency(completedSale.grand_total)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pt-1">
              <span>{lang === 'bn' ? 'পরিশোধিত:' : 'Paid:'} {formatCurrency(completedSale.paid_amount)}</span>
              {completedSale.due_amount > 0 && (
                <span className="text-rose-600 font-bold">{lang === 'bn' ? 'বকেয়া:' : 'Due:'} {formatCurrency(completedSale.due_amount)}</span>
              )}
              {completedSale.change_amount > 0 && (
                <span className="text-emerald-600 font-bold">{lang === 'bn' ? 'ফেরত:' : 'Change:'} {formatCurrency(completedSale.change_amount)}</span>
              )}
            </div>

            {/* Loyalty Points Info */}
            {(completedSale.points_earned > 0 || completedSale.points_redeemed > 0 || completedSale.customer_points_balance > 0) && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'লয়ালটি রিওয়ার্ড তথ্য' : 'Loyalty Points Info'}</span>
                </div>
                {completedSale.points_redeemed > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>{lang === 'bn' ? 'পয়েন্ট ব্যবহার (ছাড়):' : 'Points Redeemed:'}</span>
                    <span>-{completedSale.points_redeemed} pt (-৳{completedSale.points_discount_amount})</span>
                  </div>
                )}
                {completedSale.points_earned > 0 && (
                  <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-semibold">
                    <span>{lang === 'bn' ? 'এই বিক্রয়ে নতুন অর্জিত:' : 'Earned this sale:'}</span>
                    <span>+{completedSale.points_earned} pt</span>
                  </div>
                )}
                {completedSale.customer_points_balance !== null && completedSale.customer_points_balance !== undefined && (
                  <div className="flex justify-between font-black text-slate-800 dark:text-slate-200">
                    <span>{lang === 'bn' ? 'বর্তমান মোট ব্যালেন্স:' : 'Current Points Balance:'}</span>
                    <span>{completedSale.customer_points_balance} pts</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Receipt Format Switcher & Action Buttons */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-center">
              {lang === 'bn' ? 'প্রিন্ট পেপার ফরম্যাট নির্বাচন করুন:' : 'Select Receipt Paper Size:'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setReceiptFormat('80mm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${receiptFormat === '80mm'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
              >
                80mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setReceiptFormat('58mm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${receiptFormat === '58mm'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
              >
                58mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setReceiptFormat('a4')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${receiptFormat === 'a4'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
              >
                A4 Invoice
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t('print')}</span>
              </button>
              <button
                onClick={() => {
                  setCompletedSale(null);
                  setTimeout(() => barcodeInputRef.current?.focus(), 150);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('newSale')}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Printable Area Controlled A to Z by Super Admin Settings */}
          {(() => {
            const isSettingOn = (key, defaultVal = true) => {
              if (!shopSettings || shopSettings[key] === undefined) return defaultVal;
              return shopSettings[key] === '1' || shopSettings[key] === 1 || shopSettings[key] === true;
            };

            const itemDiscountTotal = completedSale.items?.reduce(
              (acc, it) => acc + (Number(it.discount_amount || 0) * Number(it.quantity || 1)),
              0
            ) || Number(completedSale.product_discount_total || 0) || 0;
            const pointsDiscount = Number(completedSale.points_discount_amount || 0);
            const orderDiscount = Number(completedSale.order_discount_amount || 0);
            const totalDiscount = itemDiscountTotal + pointsDiscount + orderDiscount;

            return (
              <div id="printable-area" className="hidden print:block text-black">
                {/* 1. 80mm Standard Thermal Slip */}
                {receiptFormat === '80mm' && (
                  <div className="receipt-80mm p-2">
                    {/* Header */}
                    <div className="text-center pb-2 border-b border-dashed border-black">
                      {isSettingOn('show_shop_logo', true) && shopSettings.shop_logo && (
                        <img src={shopSettings.shop_logo} alt="Logo" className="w-12 h-12 mx-auto mb-1 object-contain" />
                      )}
                      <div className="font-extrabold text-base uppercase">
                        {shopSettings.shop_name || 'ISRAFIL BD SHOP'}
                      </div>
                      {isSettingOn('show_shop_tagline', true) && shopSettings.shop_tagline && (
                        <div className="text-[10px] text-gray-700">{shopSettings.shop_tagline}</div>
                      )}
                      <div className="text-[10px] text-gray-800 mt-0.5">
                        {isSettingOn('show_shop_address', true) && <span>{shopSettings.shop_address || 'ঢাকা, বাংলাদেশ'}</span>}
                        {isSettingOn('show_shop_phone', true) && <span> • {shopSettings.shop_phone || '+৮৮০ ১৭০০-০০০০০০'}</span>}
                        {isSettingOn('show_shop_email', true) && shopSettings.shop_email && <span> • {shopSettings.shop_email}</span>}
                      </div>
                      {isSettingOn('show_vat_bin', true) && shopSettings.vat_bin_number && (
                        <div className="text-[10px] font-bold mt-0.5">BIN/VAT: {shopSettings.vat_bin_number}</div>
                      )}
                      <div className="text-[11px] font-bold mt-1 uppercase tracking-wider">
                        {shopSettings.receipt_header_title || 'CASH RECEIPT / ক্যাশ মেমো'}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="py-1 text-[10px] space-y-0.5 border-b border-dashed border-black">
                      <div>Invoice: {completedSale.invoice_number}</div>
                      {isSettingOn('show_invoice_date_time', true) && (
                        <div>Date: {new Date(completedSale.sale_date).toLocaleString()}</div>
                      )}
                      {isSettingOn('show_customer_info', true) && (
                        <div>
                          <span>Customer: {completedSale.customer_name}</span>
                          {completedSale.customer_phone && <span className="ml-1">({completedSale.customer_phone})</span>}
                        </div>
                      )}
                      {isSettingOn('show_cashier_name', true) && (
                        <div>Cashier: {completedSale.user?.name || 'Cashier'}</div>
                      )}
                    </div>

                    {/* Items Table: SL | Item Desc | Disc | Rate | Qnty | Amount */}
                    <table className="w-full my-2 text-[9.5px] table-fixed">
                      <colgroup>
                        <col style={{ width: '22px' }} />
                        <col />
                        <col style={{ width: '36px' }} />
                        <col style={{ width: '46px' }} />
                        <col style={{ width: '32px' }} />
                        <col style={{ width: '48px' }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-black text-left font-bold">
                          <th className="py-1 text-left">SL</th>
                          <th className="py-1 text-left">Item Desc</th>
                          <th className="py-1 text-right">Disc</th>
                          <th className="py-1 text-right">Rate</th>
                          <th className="py-1 text-center">Qnty</th>
                          <th className="py-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedSale.items?.map((it, idx) => (
                          <React.Fragment key={it.id}>
                            <tr>
                              <td className="pt-1 align-top font-mono text-left">{idx + 1}</td>
                              <td className="pt-1"></td>
                              <td className="pt-1 align-top text-right font-mono">
                                {Number(it.discount_amount || 0) > 0 ? (Number(it.discount_amount) * Number(it.quantity || 1)).toFixed(2) : '0'}
                              </td>
                              <td className="pt-1 align-top text-right font-mono">{Number(it.unit_price).toFixed(2)}</td>
                              <td className="pt-1 align-top text-center font-mono">{it.quantity}</td>
                              <td className="pt-1 align-top text-right font-mono font-bold">{Number(it.total).toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-dashed border-gray-400">
                              <td></td>
                              <td colSpan="5" className="pb-1.5 pl-0 text-left font-semibold">
                                {it.product_name}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals & Clear Discount Callout */}
                    <div className="pt-2 border-t border-dashed border-black text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-mono">৳{completedSale.subtotal}</span>
                      </div>

                      {/* Item Auto Discounts */}
                      {isSettingOn('show_item_discount', true) && itemDiscountTotal > 0 && (
                        <div className="flex justify-between text-[10px]">
                          <span>Product Discounts:</span>
                          <span className="font-mono">-৳{itemDiscountTotal}</span>
                        </div>
                      )}

                      {/* Loyalty Points Discount */}
                      {pointsDiscount > 0 && (
                        <div className="flex justify-between text-[10px]">
                          <span>Points Discount (-{completedSale.points_redeemed} pt):</span>
                          <span className="font-mono">-৳{pointsDiscount}</span>
                        </div>
                      )}

                      {/* Order / Extra Discount */}
                      {orderDiscount > 0 && (
                        <div className="flex justify-between text-[10px]">
                          <span>Special Discount:</span>
                          <span className="font-mono">-৳{orderDiscount}</span>
                        </div>
                      )}

                      {/* Total Discount Received Callout */}
                      {isSettingOn('show_total_discount', true) && totalDiscount > 0 && (
                        <div className="flex justify-between font-bold text-[11px] border-y border-dotted border-black py-0.5">
                          <span>মোট ছাড় (Total Discount):</span>
                          <span className="font-mono">-৳{totalDiscount}</span>
                        </div>
                      )}

                      {completedSale.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span>ভ্যাট (VAT):</span>
                          <span className="font-mono">৳{completedSale.tax_amount}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-extrabold text-sm border-t border-black pt-1">
                        <span>NET PAYABLE:</span>
                        <span className="font-mono">৳{completedSale.grand_total}</span>
                      </div>

                      {isSettingOn('show_due_change', true) && (
                        <>
                          <div className="flex justify-between text-[10px]">
                            <span>Paid:</span>
                            <span className="font-mono">৳{completedSale.paid_amount}</span>
                          </div>
                          {completedSale.change_amount > 0 && (
                            <div className="flex justify-between text-[10px]">
                              <span>Change Return:</span>
                              <span className="font-mono">৳{completedSale.change_amount}</span>
                            </div>
                          )}
                          {completedSale.due_amount > 0 && (
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>Due Amount:</span>
                              <span className="font-mono">৳{completedSale.due_amount}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Savings Callout */}
                      {totalDiscount > 0 && (
                        <div className="text-center text-[10px] font-bold py-1 bg-gray-100 border border-gray-400 rounded my-1">
                          🎉 আপনি সর্বমোট ৳{totalDiscount} সাশ্রয় করেছেন!
                        </div>
                      )}

                      {/* Loyalty Points Section */}
                      {isSettingOn('show_loyalty_points', true) && (
                        <div className="pt-1 border-t border-dotted border-black text-[10px] space-y-0.5">
                          {completedSale.points_earned > 0 && (
                            <div className="flex justify-between font-semibold">
                              <span>Points Earned:</span>
                              <span>+{completedSale.points_earned} pt</span>
                            </div>
                          )}
                          {completedSale.customer_points_balance !== null && completedSale.customer_points_balance !== undefined && (
                            <div className="flex justify-between font-bold">
                              <span>Total Points Balance:</span>
                              <span>{completedSale.customer_points_balance} pts</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer & Barcode */}
                    <div className="text-center text-[9px] pt-3 mt-2 border-t border-dashed border-black space-y-1">
                      <div>{shopSettings.receipt_footer || 'Thank you for shopping with ISRAFIL BD SHOP!'}</div>
                      {isSettingOn('show_terms_conditions', true) && shopSettings.receipt_terms && (
                        <div className="text-[8px] italic text-gray-700">{shopSettings.receipt_terms}</div>
                      )}
                      {isSettingOn('show_receipt_barcode', true) && (
                        <div className="pt-2">
                          <BarcodeSvg code={completedSale.invoice_number} height={32} className="w-3/4 mx-auto" />
                          <div className="font-mono text-[9px] font-bold tracking-widest mt-0.5">
                            {completedSale.invoice_number}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. 58mm Thermal Slip */}
                {receiptFormat === '58mm' && (
                  <div className="receipt-58mm p-1 text-[9px]">
                    <div className="text-center pb-1 border-b border-dashed border-black">
                      <div className="font-extrabold text-xs">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</div>
                      {isSettingOn('show_vat_bin', true) && shopSettings.vat_bin_number && (
                        <div className="text-[8px]">BIN: {shopSettings.vat_bin_number}</div>
                      )}
                      <div>Inv: {completedSale.invoice_number}</div>
                      {isSettingOn('show_invoice_date_time', true) && (
                        <div>{new Date(completedSale.sale_date).toLocaleDateString()}</div>
                      )}
                    </div>
                    <table className="w-full my-1 text-[8.5px] leading-tight table-fixed">
                      <colgroup>
                        <col style={{ width: '16px' }} />
                        <col />
                        <col style={{ width: '28px' }} />
                        <col style={{ width: '36px' }} />
                        <col style={{ width: '24px' }} />
                        <col style={{ width: '38px' }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-black text-left font-bold">
                          <th className="py-0.5 text-left">SL</th>
                          <th className="py-0.5 text-left">Item Desc</th>
                          <th className="py-0.5 text-right">Disc</th>
                          <th className="py-0.5 text-right">Rate</th>
                          <th className="py-0.5 text-center">Qnty</th>
                          <th className="py-0.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedSale.items?.map((it, idx) => (
                          <React.Fragment key={it.id}>
                            <tr>
                              <td className="pt-0.5 align-top font-mono text-left">{idx + 1}</td>
                              <td className="pt-0.5"></td>
                              <td className="pt-0.5 align-top text-right font-mono">
                                {Number(it.discount_amount || 0) > 0 ? (Number(it.discount_amount) * Number(it.quantity || 1)).toFixed(2) : '0'}
                              </td>
                              <td className="pt-0.5 align-top text-right font-mono">{Number(it.unit_price).toFixed(2)}</td>
                              <td className="pt-0.5 align-top text-center font-mono">{it.quantity}</td>
                              <td className="pt-0.5 align-top text-right font-mono font-bold">{Number(it.total).toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-dashed border-gray-400">
                              <td></td>
                              <td colSpan="5" className="pb-1 pl-0 text-left font-semibold truncate max-w-[130px]">
                                {it.product_name}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    <div className="pt-1 space-y-0.5">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="font-mono">৳{completedSale.grand_total}</span>
                      </div>
                      {isSettingOn('show_total_discount', true) && totalDiscount > 0 && (
                        <div className="flex justify-between text-[8px] font-bold">
                          <span>Total Disc:</span>
                          <span className="font-mono">-৳{totalDiscount}</span>
                        </div>
                      )}
                      {isSettingOn('show_due_change', true) && (
                        <>
                          <div className="flex justify-between font-normal text-[8px]">
                            <span>Paid:</span>
                            <span className="font-mono">৳{completedSale.paid_amount}</span>
                          </div>
                          {completedSale.change_amount > 0 && (
                            <div className="flex justify-between font-normal text-[8px]">
                              <span>Change:</span>
                              <span className="font-mono">৳{completedSale.change_amount}</span>
                            </div>
                          )}
                        </>
                      )}
                      {isSettingOn('show_loyalty_points', true) && completedSale.points_earned > 0 && (
                        <div className="text-[8px] font-normal">Earned: +{completedSale.points_earned} pt</div>
                      )}
                    </div>
                    <div className="text-center text-[8px] pt-2 border-t border-dashed border-black mt-1">
                      <div>{shopSettings.receipt_footer || 'Thank You!'}</div>
                      {isSettingOn('show_receipt_barcode', true) && (
                        <div className="pt-1">
                          <BarcodeSvg code={completedSale.invoice_number} height={26} className="w-4/5 mx-auto" />
                          <div className="font-mono text-[8px]">{completedSale.invoice_number}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. A4 Official Tax Invoice */}
                {receiptFormat === 'a4' && (
                  <div className="p-8 max-w-3xl mx-auto border border-slate-300">
                    <div className="flex justify-between items-start pb-6 border-b border-slate-300">
                      <div>
                        {isSettingOn('show_shop_logo', true) && shopSettings.shop_logo && (
                          <img src={shopSettings.shop_logo} alt="Logo" className="w-16 h-16 mb-2 object-contain" />
                        )}
                        <h1 className="text-2xl font-black text-indigo-700">{shopSettings.shop_name || 'ISRAFIL BD SHOP'}</h1>
                        {isSettingOn('show_shop_tagline', true) && shopSettings.shop_tagline && (
                          <p className="text-xs text-slate-500">{shopSettings.shop_tagline}</p>
                        )}
                        <p className="text-xs text-slate-600">
                          {isSettingOn('show_shop_address', true) && <span>{shopSettings.shop_address || 'ঢাকা, বাংলাদেশ'}</span>}
                          {isSettingOn('show_shop_phone', true) && <span> • ফোন: {shopSettings.shop_phone || '+৮৮০ ১৭০০-০০০০০০'}</span>}
                        </p>
                        {isSettingOn('show_vat_bin', true) && shopSettings.vat_bin_number && (
                          <p className="text-xs font-bold text-slate-700 mt-1">BIN/VAT Reg: {shopSettings.vat_bin_number}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold uppercase text-slate-800">
                          {shopSettings.receipt_header_title || 'TAX INVOICE'}
                        </span>
                        <p className="text-xs font-semibold mt-1">Invoice #: {completedSale.invoice_number}</p>
                        {isSettingOn('show_invoice_date_time', true) && (
                          <p className="text-xs text-slate-500">Date: {new Date(completedSale.sale_date).toLocaleString()}</p>
                        )}
                        {isSettingOn('show_receipt_barcode', true) && (
                          <div className="mt-2 w-44 ml-auto">
                            <BarcodeSvg code={completedSale.invoice_number} height={32} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="my-4 p-3 bg-slate-50 flex justify-between text-xs">
                      <div>
                        {isSettingOn('show_customer_info', true) && (
                          <>
                            <span className="font-bold text-slate-500 uppercase block text-[10px]">Customer</span>
                            <div className="font-bold">{completedSale.customer_name}</div>
                            {completedSale.customer_phone && <div className="text-slate-500">{completedSale.customer_phone}</div>}
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        {isSettingOn('show_cashier_name', true) && (
                          <>
                            <span className="font-bold text-slate-500 uppercase block text-[10px]">Cashier</span>
                            <div className="font-bold">{completedSale.user?.name || 'Staff'}</div>
                          </>
                        )}
                      </div>
                    </div>

                    <table className="w-full my-4 text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                          <th className="p-2 w-10 text-left">SL</th>
                          <th className="p-2 text-left">Item Desc</th>
                          <th className="p-2 text-right">Disc</th>
                          <th className="p-2 text-right">Rate</th>
                          <th className="p-2 text-center">Qnty</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedSale.items?.map((it, idx) => (
                          <React.Fragment key={it.id}>
                            <tr className="border-t border-slate-200">
                              <td className="pt-2 px-2 align-top font-mono w-10 text-left">{idx + 1}</td>
                              <td className="pt-2 px-2"></td>
                              <td className="pt-2 px-2 align-top text-right font-mono text-emerald-600">
                                {Number(it.discount_amount || 0) > 0 ? `-৳${(Number(it.discount_amount) * Number(it.quantity || 1)).toFixed(2)}` : '0'}
                              </td>
                              <td className="pt-2 px-2 align-top text-right font-mono">৳{Number(it.unit_price).toFixed(2)}</td>
                              <td className="pt-2 px-2 align-top text-center font-mono">{it.quantity}</td>
                              <td className="pt-2 px-2 align-top text-right font-bold font-mono">৳{Number(it.total).toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                              <td className="w-10"></td>
                              <td colSpan="5" className="px-2 pb-2 text-left font-semibold text-slate-900">
                                {it.product_name}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                      <div className="w-72 space-y-1.5 text-xs">
                        <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono">৳{completedSale.subtotal}</span></div>
                        {isSettingOn('show_total_discount', true) && totalDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded">
                            <span>মোট ছাড় (Total Discount):</span>
                            <span className="font-mono">-৳{totalDiscount}</span>
                          </div>
                        )}
                        {completedSale.tax_amount > 0 && (
                          <div className="flex justify-between"><span>ভ্যাট (VAT):</span><span className="font-mono">৳{completedSale.tax_amount}</span></div>
                        )}
                        <div className="flex justify-between font-black text-base border-t border-black pt-1">
                          <span>Grand Total:</span>
                          <span className="font-mono">৳{completedSale.grand_total}</span>
                        </div>
                        {isSettingOn('show_due_change', true) && (
                          <>
                            <div className="flex justify-between"><span>Paid:</span><span className="font-mono">৳{completedSale.paid_amount}</span></div>
                            {completedSale.change_amount > 0 && (
                              <div className="flex justify-between text-emerald-600"><span>Change Return:</span><span className="font-mono">৳{completedSale.change_amount}</span></div>
                            )}
                            {completedSale.due_amount > 0 && (
                              <div className="flex justify-between text-rose-600 font-bold"><span>Due Amount:</span><span className="font-mono">৳{completedSale.due_amount}</span></div>
                            )}
                          </>
                        )}
                        {isSettingOn('show_loyalty_points', true) && completedSale.points_earned > 0 && (
                          <div className="flex justify-between text-indigo-700 font-semibold pt-1 border-t border-slate-200">
                            <span>Points Earned:</span><span>+{completedSale.points_earned} pt</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Terms & Footer */}
                    <div className="mt-8 pt-4 border-t border-slate-300 text-center text-xs text-slate-500 space-y-1">
                      <div>{shopSettings.receipt_footer || 'Thank you for your business!'}</div>
                      {isSettingOn('show_terms_conditions', true) && shopSettings.receipt_terms && (
                        <div className="italic text-[10px] text-slate-400">{shopSettings.receipt_terms}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        /* Regular POS Terminal Screen - Spacious, Beautiful, Full Width */
        <div className="flex flex-col lg:flex-row gap-3.5 items-start w-full">
          {/* Left Column (Spacious Products Area): Takes all available width for wider product cards */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Top Unified Control Bar: Barcode (Left), Text Search (Right), Live Scanner Status */}
            <div className="bg-white dark:bg-[#1E293B] p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
              {/* Barcode Scanner Input */}
              <form onSubmit={handleBarcodeSubmit} className="relative flex-1 w-full">
                <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder={lang === 'bn' ? 'বারকোড স্ক্যান করুন বা লিখুন (Enter চাপুন)...' : 'Scan barcode or enter manually (Press Enter)...'}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </form>

              {/* Product Live Search */}
              <div className="relative w-full md:w-80 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'পণ্য বা কোড দিয়ে খুঁজুন...' : 'Search products by name/code...'}
                  value={productSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Live Scanner Ready Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{lang === 'bn' ? 'স্ক্যানার সক্রিয়' : 'Scanner Ready'}</span>
              </div>

              {/* Reload / Sync Button */}
              <button
                type="button"
                onClick={fetchInitialData}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
                title="Reload Products"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* CATEGORY BAR (All + 3 Categories + {...} More Dropdown) & VIEW MODE TOGGLE */}
            <div className="relative w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
                {/* All Items */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory(null)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${selectedCategory === null
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'সকল পণ্য' : 'All Items'}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${selectedCategory === null
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                  >
                    {products.length}
                  </span>
                </button>

                {/* First 3 Categories */}
                {categories.slice(0, 3).map((cat) => {
                  const catCount = products.filter((p) => p.category_id === cat.id).length;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                          : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                    >
                      <span>{lang === 'bn' ? (cat.name_bn || cat.name) : cat.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                      >
                        {catCount}
                      </span>
                    </button>
                  );
                })}

                {/* {...} More Categories Button & Popover */}
                {categories.length > 3 && (() => {
                  const isOtherSelected = categories.slice(3).some((c) => c.id === selectedCategory);
                  const selectedOther = isOtherSelected ? categories.find((c) => c.id === selectedCategory) : null;
                  return (
                    <div className="relative" ref={moreCategoriesRef}>
                      <button
                        type="button"
                        onClick={() => setShowMoreCategories((prev) => !prev)}
                        className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${isOtherSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                          }`}
                        title={lang === 'bn' ? 'আরও ক্যাটাগরি' : 'More Categories'}
                      >
                        <span className="font-mono">{'...'}</span>
                        {isOtherSelected ? (
                          <span className="max-w-[100px] truncate">
                            {lang === 'bn' ? (selectedOther?.name_bn || selectedOther?.name) : selectedOther?.name}
                          </span>
                        ) : (
                          <span>{lang === 'bn' ? 'আরও' : 'More'}</span>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreCategories ? 'rotate-180' : ''}`} />
                      </button>

                      {showMoreCategories && (
                        <div className="absolute left-0 top-full mt-2 w-64 max-h-72 overflow-y-auto p-2 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 px-2 py-1 uppercase tracking-wider">
                            {lang === 'bn' ? 'অন্যান্য ক্যাটাগরি' : 'Other Categories'} ({categories.length - 3})
                          </div>
                          {categories.slice(3).map((cat) => {
                            const catCount = products.filter((p) => p.category_id === cat.id).length;
                            const isSelected = selectedCategory === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  handleSelectCategory(cat.id);
                                  setShowMoreCategories(false);
                                }}
                                className={`w-full px-3 py-2 rounded-xl text-xs text-left transition flex items-center justify-between cursor-pointer ${isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                                  }`}
                              >
                                <span className="truncate">{lang === 'bn' ? (cat.name_bn || cat.name) : cat.name}</span>
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                                  {catCount}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* View Mode Toggle: Grid vs List */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs shrink-0">
                <button
                  type="button"
                  onClick={() => handleSetViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  title={lang === 'bn' ? 'গ্রিড ভিউ (প্রতি সারিতে ৪টি)' : 'Grid View (4 items per row)'}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  title={lang === 'bn' ? 'লিস্ট ভিউ' : 'List View'}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Search Filter Banner */}
            {productSearch && (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in">
                <span className="flex items-center gap-1.5 font-medium">
                  <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    {lang === 'bn'
                      ? `"${productSearch}" অনুসন্ধানের ফলাফল: ${filteredProducts.length}টি পণ্য পাওয়া গেছে`
                      : `Search results for "${productSearch}": ${filteredProducts.length} items`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="px-2 py-0.5 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'সব পণ্য দেখান' : 'Show All'}</span>
                </button>
              </div>
            )}

            {/* Products Display (Empty State / 4-Col Grid View / List View) */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800">
                <Package className="w-10 h-10 mx-auto opacity-30 stroke-1" />
                <p className="text-sm font-semibold">
                  {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No products found matching criteria.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              /* 4-Columns Grid View (Spacious width, 1-line title with ...) */
              <div
                ref={catalogScrollRef}
                onScroll={(e) => {
                  try {
                    sessionStorage.setItem('israfil_pos_catalog_scroll', String(e.currentTarget.scrollTop));
                  } catch (err) {}
                }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3.5 max-h-[calc(100vh-215px)] overflow-y-auto pr-1"
              >
                {filteredProducts.map((prod) => {
                  const stock = Number(prod.current_stock);
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock <= Number(prod.alert_stock);
                  const discountInfo = getProductDiscountInfo(prod);
                  const categoryTheme = getCategoryTheme(prod.category?.name);
                  const CategoryIcon = categoryTheme.Icon;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        if (catalogScrollRef.current) {
                          try {
                            sessionStorage.setItem('israfil_pos_catalog_scroll', String(catalogScrollRef.current.scrollTop));
                          } catch (err) {}
                        }
                        navigate(`/products/${prod.id}`, { state: { from: 'pos' } });
                      }}
                      className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/80 dark:hover:border-indigo-400 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99] select-none relative min-h-[355px] sm:min-h-[375px]"
                      title={lang === 'bn' ? 'বিস্তারিত এবং বারকোড দেখতে ক্লিক করুন' : 'Click to view product details & barcode'}
                    >
                      {/* === 1. UP (Top Row): Category Pill & Stock Status Pill === */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        {/* Category Pill (Wheat/category icon + Name on soft tinted pill) */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-100/90 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200 shrink-0 max-w-[55%] shadow-2xs">
                          <CategoryIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 stroke-[2.2]" />
                          <span className="font-bold text-[11px] sm:text-xs truncate">
                            {lang === 'bn' ? (prod.category?.name_bn || prod.category?.name || 'আইটেম') : (prod.category?.name || 'Item')}
                          </span>
                        </div>

                        {/* Stock Status Pill (Colored Dot + Status Text on soft pill) */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border shrink-0 shadow-2xs ${
                            isOutOfStock
                              ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                              : isLowStock
                              ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isOutOfStock
                                ? 'bg-rose-500'
                                : isLowStock
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span className="truncate">
                            {isOutOfStock
                              ? (lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock')
                              : (lang === 'bn' ? `স্টক: ${stock}` : `In Stock: ${stock}`)}
                          </span>
                        </div>
                      </div>

                      {/* === 2. MIDDLE: Product Image / Media Presentation Showcase === */}
                      <div className="relative w-full mb-2.5">
                        <ProductCardMedia
                          product={prod}
                          className="h-36 sm:h-40"
                        />

                        {/* Floating Discount & VAT Badges on Image */}
                        {discountInfo.hasDiscount && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-black bg-rose-600 text-white shadow-sm flex items-center gap-1 animate-pulse z-10 pointer-events-none">
                            <Tag className="w-2.5 h-2.5" />
                            <span className="truncate">{discountInfo.badge}</span>
                          </span>
                        )}
                        {Number(prod.tax_percent) > 0 && (
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-blue-600/90 text-white shadow-xs z-10 pointer-events-none">
                            +{Number(prod.tax_percent)}% VAT
                          </span>
                        )}
                      </div>

                      {/* === 3. DOWN (Bottom Section): Title, Barcode Capsule, Divider & Action Controls === */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <h3
                            className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"
                            title={lang === 'bn' ? (prod.name_bn || prod.name) : prod.name}
                          >
                            {lang === 'bn' ? (prod.name_bn || prod.name) : prod.name}
                          </h3>

                          {/* Barcode & Unit Capsule */}
                          <div className="mt-1.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 max-w-full">
                            {/* Barcode */}
                            <div className="flex items-center gap-1 font-mono font-medium truncate">
                              <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{prod.barcode}</span>
                            </div>
                            {/* Separator Pipe */}
                            <span className="text-slate-300 dark:text-slate-600 shrink-0">|</span>
                            {/* Unit */}
                            <div className="flex items-center gap-1 font-medium truncate">
                              <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{formatUnitDisplay(prod.unit, prod.measurement_value)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Subtle Horizontal Divider */}
                        <div className="border-t border-slate-100 dark:border-slate-800/80 my-2.5" />

                        {/* Bottom Row: Price + Stepper + Add Button */}
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                          {/* Price */}
                          <div className="shrink-0">
                            <div className="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                              {formatCurrency(discountInfo.finalPrice)}
                            </div>
                            {discountInfo.hasDiscount && (
                              <div className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                                {formatCurrency(prod.selling_price)}
                              </div>
                            )}
                          </div>

                          {/* Stepper + Add Button Cluster */}
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Stepper: [-] Qty [+] */}
                            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={(e) => handleCardMinus(e, prod)}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition cursor-pointer"
                                title={lang === 'bn' ? 'কমান' : 'Decrease'}
                              >
                                <Minus className="w-3 h-3 stroke-[2.5]" />
                              </button>
                              <span className="w-5 sm:w-6 text-center font-bold text-xs sm:text-sm text-slate-900 dark:text-white select-none">
                                {getCardQty(prod.id)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCardPlus(e, prod)}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition cursor-pointer"
                                title={lang === 'bn' ? 'বাড়ান' : 'Increase'}
                              >
                                <Plus className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            </div>

                            {/* Add Button: [🛒 Add] */}
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={(e) => handleCardAdd(e, prod)}
                              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 transition cursor-pointer shrink-0"
                              title={lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to cart'}
                            >
                              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                              <span>{lang === 'bn' ? 'যোগ' : 'Add'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Compact Horizontal List View */
              <div
                ref={catalogScrollRef}
                onScroll={(e) => {
                  try {
                    sessionStorage.setItem('israfil_pos_catalog_scroll', String(e.currentTarget.scrollTop));
                  } catch (err) {}
                }}
                className="space-y-2 max-h-[calc(100vh-215px)] overflow-y-auto pr-1"
              >
                {filteredProducts.map((prod) => {
                  const stock = Number(prod.current_stock);
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock <= Number(prod.alert_stock);
                  const discountInfo = getProductDiscountInfo(prod);
                  const categoryTheme = getCategoryTheme(prod.category?.name);
                  const CategoryIcon = categoryTheme.Icon;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        if (catalogScrollRef.current) {
                          try {
                            sessionStorage.setItem('israfil_pos_catalog_scroll', String(catalogScrollRef.current.scrollTop));
                          } catch (err) {}
                        }
                        navigate(`/products/${prod.id}`, { state: { from: 'pos' } });
                      }}
                      className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3.5 group active:scale-[0.99] select-none min-h-[78px]"
                      title={lang === 'bn' ? 'বিস্তারিত এবং বারকোড দেখতে ক্লিক করুন' : 'Click to view product details & barcode'}
                    >
                      {/* Left: Product Media Thumbnail + Title & Barcode Capsule */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <ProductCardMedia
                          product={prod}
                          isCompact={true}
                          className="w-14 h-14 sm:w-16 sm:h-16 shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"
                              title={lang === 'bn' ? (prod.name_bn || prod.name) : prod.name}
                            >
                              {lang === 'bn' ? (prod.name_bn || prod.name) : prod.name}
                            </h3>
                            {discountInfo.hasDiscount && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white shrink-0">
                                {discountInfo.badge}
                              </span>
                            )}
                            {Number(prod.tax_percent) > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shrink-0">
                                +{Number(prod.tax_percent)}% VAT
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            {/* Barcode & Unit Capsule */}
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 text-[10.5px] text-slate-500 dark:text-slate-400 max-w-full">
                              <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-mono truncate">{prod.barcode}</span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <Scale className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{formatUnitDisplay(prod.unit, prod.measurement_value)}</span>
                            </div>

                            {/* Category Pill */}
                            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10.5px] font-bold">
                              <CategoryIcon className="w-3 h-3" />
                              <span className="truncate">{prod.category?.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stock Badge */}
                      <div className="shrink-0 hidden md:block text-center px-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                              : isLowStock
                              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                              : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-500'
                                : isLowStock
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>
                            {isOutOfStock
                              ? (lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock')
                              : (lang === 'bn' ? `স্টক: ${stock}` : `In Stock: ${stock}`)}
                          </span>
                        </span>
                      </div>

                      {/* Price & Stepper + Add Action */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right min-w-[70px]">
                          <div className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(discountInfo.finalPrice)}
                          </div>
                          {discountInfo.hasDiscount && (
                            <div className="text-[10px] text-slate-400 line-through">
                              {formatCurrency(prod.selling_price)}
                            </div>
                          )}
                        </div>

                        {/* Stepper: [-] Qty [+] */}
                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={(e) => handleCardMinus(e, prod)}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs active:scale-95 transition cursor-pointer"
                            title={lang === 'bn' ? 'কমান' : 'Decrease'}
                          >
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs text-slate-900 dark:text-white select-none">
                            {getCardQty(prod.id)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCardPlus(e, prod)}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs active:scale-95 transition cursor-pointer"
                            title={lang === 'bn' ? 'বাড়ান' : 'Increase'}
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Add Button: [🛒 Add] */}
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => handleCardAdd(e, prod)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 transition cursor-pointer shrink-0"
                          title={lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to cart'}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>{lang === 'bn' ? 'যোগ' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Dedicated Spacious Cart & Instant Checkout Panel */}
          <div className="w-full lg:w-[450px] xl:w-[480px] 2xl:w-[520px] shrink-0 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4 sticky top-20 max-h-[calc(100vh-85px)]">
            {/* 1. Cart Header & Customer Selector */}
            <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
                      {lang === 'bn' ? 'শপিং কার্ট' : 'Shopping Cart'}
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-black">
                      {cart.length} {lang === 'bn' ? 'টি আইটেম' : 'items'}
                    </span>
                  </div>
                </div>

                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    {lang === 'bn' ? 'খালি করুন' : 'Clear'}
                  </button>
                )}
              </div>

              {/* Single Simple Customer Phone Input with Auto Member Lookup */}
              <div className="relative">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-2xs">
                  <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <input
                    type="tel"
                    placeholder={lang === 'bn' ? 'কাস্টমার ফোন নম্বর (যেমন: 017xxxxxxxx)...' : 'Customer phone (e.g. 017xxxxxxxx)...'}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="flex-1 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-mono"
                  />
                  {matchedCustomer ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 animate-in fade-in zoom-in-95 duration-150">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="max-w-[120px] truncate">{matchedCustomer.name}</span>
                      <span className="text-[9.5px] px-1 py-0.2 rounded bg-emerald-200/70 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 font-extrabold uppercase">
                        {lang === 'bn' ? 'মেম্বার' : 'Member'}
                      </span>
                    </div>
                  ) : customerPhone.trim() ? (
                    <button
                      type="button"
                      onClick={() => setCustomerPhone('')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      title={lang === 'bn' ? 'মুছুন' : 'Clear'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>

                {/* VIP Customer Point Redemption Bar - Appears only when customer has 100+ points */}
                {matchedCustomer && Number(matchedCustomer.loyalty_points || 0) >= 100 && (
                  <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/70 dark:from-amber-950/50 dark:to-amber-900/40 border border-amber-200/90 dark:border-amber-800/60 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-xs text-amber-900 dark:text-amber-200 truncate">
                        <span className="font-medium">{lang === 'bn' ? 'VIP পয়েন্ট:' : 'Points:'}</span>{' '}
                        <strong className="font-extrabold font-mono text-amber-950 dark:text-amber-100">
                          {matchedCustomer.loyalty_points} pt
                        </strong>{' '}
                        <span className="text-[11px] text-amber-700/80 dark:text-amber-300 font-medium">
                          (৳{(Number(matchedCustomer.loyalty_points) * 0.75).toFixed(0)})
                        </span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsRedeemingPoints(!isRedeemingPoints)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs ${
                        isRedeemingPoints
                          ? 'bg-amber-600 text-white shadow-amber-600/30 hover:bg-amber-700'
                          : 'bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-100/80 dark:hover:bg-amber-900/60'
                      }`}
                    >
                      {isRedeemingPoints ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{lang === 'bn' ? `রিডিম সক্রিয় (-৳${pointsDiscountAmount})` : `Redeemed (-৳${pointsDiscountAmount})`}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{lang === 'bn' ? 'পয়েন্ট রিডিম' : 'Redeem Points'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Cart Items List */}
            <div className="flex-1 max-h-56 xl:max-h-64 overflow-y-auto space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                    <ShoppingCart className="w-6 h-6 stroke-1" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    {lang === 'bn' ? 'কার্ট খালি রয়েছে' : 'Your cart is empty'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'বারকোড স্ক্যান করুন বা প্রোডাক্টে ক্লিক করুন' : 'Scan barcode or click items to add'}
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="p-2 sm:p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition flex items-center justify-between gap-2.5"
                  >
                    {/* Left: Thumbnail + Full Product Title + Unit Price & Auto Discount in One Line */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <ProductCardMedia
                        product={item}
                        isCompact={true}
                        className="w-9 h-9 shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate"
                          title={lang === 'bn' ? (item.name_bn || item.name) : item.name}
                        >
                          {lang === 'bn' ? (item.name_bn || item.name) : item.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                          <span>{formatCurrency(item.unit_price)} × {item.quantity} {item.unit}</span>
                          {item.discount_amount > 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                              -{formatCurrency(item.discount_amount)}
                            </span>
                          )}
                          {Number(item.tax_percent) > 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-[10px] shrink-0">
                              +{Number(item.tax_percent)}% VAT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quantity Stepper + Line Total + Trash Action */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product_id, -1)}
                          className="w-5.5 h-5.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
                          title={lang === 'bn' ? 'কমান' : 'Decrease'}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => setExplicitQuantity(item.product_id, e.target.value)}
                          className="w-7 py-0.5 text-center font-bold bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product_id, 1)}
                          className="w-5.5 h-5.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
                          title={lang === 'bn' ? 'বাড়ান' : 'Increase'}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right min-w-[55px]">
                        <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                          {formatCurrency(item.unit_price * item.quantity - (item.discount_amount || 0))}
                        </div>
                        {item.discount_amount > 0 && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(item.unit_price * item.quantity)}
                          </div>
                        )}
                      </div>

                      {/* Trash Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition shrink-0 cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. Distinct Calculations & Order Discount Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                <span>{lang === 'bn' ? 'উপমোট (Subtotal)' : 'Subtotal'}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
              </div>

              {/* Product Auto Discounts */}
              {totalItemDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Tag className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'পণ্য বিশেষ ছাড় (Auto)' : 'Auto Discount'}:</span>
                  </span>
                  <span>-{formatCurrency(totalItemDiscount)}</span>
                </div>
              )}

              {/* VIP Points Redemption Discount */}
              {pointsDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{lang === 'bn' ? 'VIP পয়েন্ট ছাড়' : 'VIP Points Discount'} ({effectiveRedeemPoints} pt):</span>
                  </span>
                  <span>-{formatCurrency(pointsDiscountAmount)}</span>
                </div>
              )}



              {totalTax > 0 && (
                <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-800/40 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'মোট ভ্যাট (VAT)' : 'Total VAT'}:</span>
                  </span>
                  <span className="font-mono text-xs sm:text-sm">+{formatCurrency(totalTax)}</span>
                </div>
              )}

              {/* Grand Total Row Prominent */}
              <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                <span className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'সর্বমোট প্রদেয়' : 'Grand Total'}:
                </span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* 4. Payment Dock Section */}
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {/* Payment Method Tabs */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'cash', bn: 'ক্যাশ', en: 'Cash' },
                  { key: 'bkash', bn: 'বিকাশ', en: 'bKash' },
                  { key: 'nagad', bn: 'নগদ', en: 'Nagad' },
                  { key: 'card', bn: 'কার্ড', en: 'Card' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPaymentMethod(m.key)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center ${paymentMethod === m.key
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                  >
                    {lang === 'bn' ? m.bn : m.en}
                  </button>
                ))}
              </div>

              {/* Cash Received Box & Calculation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                {/* Header label & Exact Button */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'bn' ? 'কাস্টমার কত টাকা দিয়েছেন?' : 'Cash Received / Tendered'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => addQuickCash('exact')}
                    className="px-2.5 py-1 text-[11px] font-black rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'bn' ? 'বিল বরাবর টাকা গ্রহণ' : 'Exact Amount'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{lang === 'bn' ? 'বরাবর (Exact)' : 'Exact'}</span>
                  </button>
                </div>

                {/* Main Cash Input with Currency Symbol */}
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-black text-slate-400 select-none pointer-events-none">৳</span>
                  <input
                    type="number"
                    min="0"
                    placeholder={grandTotal > 0 ? String(grandTotal) : '0'}
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-base font-black rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-xs"
                  />
                  {tenderedAmount && (
                    <button
                      type="button"
                      onClick={() => setTenderedAmount('')}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quick Cash Buttons (+50, +100, +500, +1000) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                  {[50, 100, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => addQuickCash(amt)}
                      className="flex-1 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 transition whitespace-nowrap active:scale-95 shadow-2xs"
                    >
                      +৳{amt}
                    </button>
                  ))}
                </div>

                {/* Live Minus Calculation: (Received Amount - Product Total = Customer Back) */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition ${dueAmount > 0
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
                  }`}>
                  <div>
                    <span className="text-xs font-black block uppercase tracking-wider">
                      {dueAmount > 0
                        ? (lang === 'bn' ? '⚠️ বকেয়া থাকবে (Due Amount)' : '⚠️ Due Amount')
                        : (lang === 'bn' ? '✅ কাস্টমার ফেরত পাবেন (Change Return)' : '✅ Customer Gets Back')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
                      {dueAmount > 0
                        ? `${lang === 'bn' ? 'মোট বিল' : 'Bill'} ${formatCurrency(grandTotal)} − ${lang === 'bn' ? 'প্রদত্ত' : 'Paid'} ${formatCurrency(numericTendered)}`
                        : `${lang === 'bn' ? 'প্রদত্ত' : 'Paid'} ${formatCurrency(numericTendered)} − ${lang === 'bn' ? 'মোট বিল' : 'Bill'} ${formatCurrency(grandTotal)}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black block ${dueAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                      {dueAmount > 0 ? formatCurrency(dueAmount) : formatCurrency(changeAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {lang === 'bn'
                        ? `পেমেন্ট সম্পন্ন করুন (${formatCurrency(grandTotal)})`
                        : `Complete Checkout (${formatCurrency(grandTotal)})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosTerminal;
