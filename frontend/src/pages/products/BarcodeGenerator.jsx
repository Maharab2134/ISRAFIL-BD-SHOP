import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Barcode, Printer, Search } from 'lucide-react';
import api from '../../services/api';

export const BarcodeGenerator = () => {
  const { t, lang, formatCurrency } = useLanguage();
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
  }, [lang]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Barcode className="w-7 h-7 text-indigo-600" />
            {t('barcodeGenerator')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn' ? 'পণ্যের বারকোড স্টিকার প্রিন্ট ও তৈরি করুন' : 'Generate and print thermal barcode labels and price stickers'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="py-2.5 px-5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 self-start transition"
        >
          <Printer className="w-4 h-4" />
          <span>{lang === 'bn' ? 'বারকোড স্টিকার প্রিন্ট করুন' : 'Print Barcode Stickers'}</span>
        </button>
      </div>

      {/* Controls Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'পণ্য নির্বাচন করুন' : 'Select Product'}
          </label>
          <select
            value={selectedProduct ? selectedProduct.id : ''}
            onChange={(e) => {
              const p = products.find((x) => x.id === Number(e.target.value));
              setSelectedProduct(p || null);
            }}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {lang === 'bn' ? (p.name_bn || p.name) : p.name} ({p.barcode})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'স্টিকার সংখ্যা (Quantity)' : 'Label Quantity'}
          </label>
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
            <span>{lang === 'bn' ? 'মূল্য প্রদর্শন করুন' : 'Show Retail Price'}</span>
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
            <span>{lang === 'bn' ? 'দোকানের নাম প্রদর্শন' : 'Show Brand Name'}</span>
          </label>
        </div>
      </div>

      {/* Barcode Stickers Preview & Print Grid */}
      {selectedProduct && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 no-print">
            {lang === 'bn' ? 'প্রিন্ট প্রিভিউ (Print Sheet Preview):' : 'Print Sheet Preview:'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
            {Array.from({ length: quantity }).map((_, i) => (
              <div
                key={i}
                className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center bg-white text-black flex flex-col items-center justify-between shadow-sm page-break-inside-avoid"
              >
                {showShopName && (
                  <div className="text-[10px] font-black tracking-tight uppercase">
                    ISRAFIL BD SHOP
                  </div>
                )}
                <div className="text-[11px] font-bold line-clamp-1 mt-1">
                  {lang === 'bn' ? (selectedProduct.name_bn || selectedProduct.name) : selectedProduct.name}
                </div>

                {/* Simulated clean barcode graphic */}
                <div className="my-2 flex flex-col items-center">
                  <div className="flex items-center justify-center gap-[2px] h-9">
                    {[1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3, 1, 2, 1, 2].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-black h-full"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <div className="font-mono text-[10px] tracking-widest mt-1">
                    {selectedProduct.barcode}
                  </div>
                </div>

                {showPrice && (
                  <div className="text-xs font-black text-slate-900 border-t border-slate-200 w-full pt-1">
                    {formatCurrency(selectedProduct.selling_price)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeGenerator;
