import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Barcode, Printer, Search } from 'lucide-react';
import api from '../../services/api';

export const BarcodeGenerator = () => {
  const { t, formatCurrency } = useLanguage();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(12);
  const [showPrice, setShowPrice] = useState(true);
  const [showShopName, setShowShopName] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?per_page=100');
        setProducts(res.data.data || []);
        if (res.data.data?.length > 0) {
          setSelectedProduct(res.data.data[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProducts();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('barcodeGenerator')}
          </h1>
          <p className="text-sm text-slate-500">পণ্যের বারকোড স্টিকার প্রিন্ট ও তৈরি করুন</p>
        </div>

        <button
          onClick={handlePrint}
          className="py-2.5 px-5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 self-start transition"
        >
          <Printer className="w-4 h-4" />
          <span>বারকোড স্টিকার প্রিন্ট করুন</span>
        </button>
      </div>

      {/* Controls Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">পণ্য নির্বাচন করুন</label>
          <select
            value={selectedProduct ? selectedProduct.id : ''}
            onChange={(e) => {
              const p = products.find((x) => x.id === Number(e.target.value));
              setSelectedProduct(p || null);
            }}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.barcode})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">স্টিকার সংখ্যা (Quantity)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showPrice}
              onChange={(e) => setShowPrice(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>মূল্য প্রদর্শন করুন</span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showShopName}
              onChange={(e) => setShowShopName(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>দোকানের নাম প্রদর্শন</span>
          </label>
        </div>
      </div>

      {/* Printable Barcode Sheet Preview */}
      <div id="printable-area" className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 no-print">
          প্রিভিউ শিট ({quantity} টি স্টিকার)
        </h2>

        {selectedProduct ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(quantity)].map((_, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white text-black flex flex-col items-center justify-center text-center space-y-1 shadow-subtle"
              >
                {showShopName && (
                  <div className="text-[10px] font-black tracking-tight uppercase text-indigo-900">
                    ISRAFIL BD SHOP
                  </div>
                )}
                <div className="text-[11px] font-bold line-clamp-1 text-slate-800">
                  {selectedProduct.name}
                </div>
                {/* Visual Barcode Graphic representation */}
                <div className="w-full flex justify-center py-1">
                  <div className="h-9 w-36 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_9px,#000_9px,#000_12px,transparent_12px,transparent_13px)]" />
                </div>
                <div className="font-mono text-[10px] font-bold tracking-widest text-slate-700">
                  {selectedProduct.barcode}
                </div>
                {showPrice && (
                  <div className="text-xs font-black text-slate-900 pt-0.5">
                    মূল্য: ৳ {selectedProduct.selling_price}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            অনুগ্রহ করে একটি পণ্য নির্বাচন করুন।
          </div>
        )}
      </div>
    </div>
  );
};
