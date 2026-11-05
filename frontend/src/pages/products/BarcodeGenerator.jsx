import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Barcode, Printer, Search, Settings2, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

// Standard Code 128 B Patterns (each is 6 digits of bar/space widths summing to 11 modules)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

/**
 * Pure SVG Barcode Renderer using standard Code 128 B.
 * Guarantees crisp vector printing on thermal and standard laser printers without browser background graphics requirement.
 */
const BarcodeSvg = ({ code, height = 38 }) => {
  const cleanCode = String(code || '0000000000').trim();

  const rects = useMemo(() => {
    let checksum = 104; // Start B symbol
    const sequence = [104];

    for (let i = 0; i < cleanCode.length; i++) {
      const charCode = cleanCode.charCodeAt(i) - 32;
      if (charCode >= 0 && charCode <= 95) {
        sequence.push(charCode);
        checksum += charCode * (i + 1);
      }
    }

    sequence.push(checksum % 103);
    sequence.push(106); // Stop symbol

    const bars = [];
    let currentX = 8; // Left quiet zone
    const unitWidth = 1.6;

    sequence.forEach((s) => {
      const pattern = CODE128_PATTERNS[s];
      if (pattern) {
        for (let p = 0; p < pattern.length; p++) {
          const width = parseInt(pattern[p], 10) * unitWidth;
          if (p % 2 === 0) {
            bars.push({ x: currentX, width });
          }
          currentX += width;
        }
      }
    });

    return { bars, totalWidth: currentX + 8 };
  }, [cleanCode]);

  return (
    <svg
      viewBox={`0 0 ${rects.totalWidth} ${height}`}
      className="w-full h-8 max-h-9 overflow-visible mx-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {rects.bars.map((r, idx) => (
        <rect
          key={idx}
          x={r.x}
          y="0"
          width={r.width}
          height={height}
          fill="#000000"
        />
      ))}
    </svg>
  );
};

export const BarcodeGenerator = () => {
  const [searchParams] = useSearchParams();
  const urlParamSearch = searchParams.get('search') || searchParams.get('barcode') || '';

  const { t, lang, formatCurrency } = useLanguage();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState(urlParamSearch);
  const [quantity, setQuantity] = useState(12);
  const [showPrice, setShowPrice] = useState(true);
  const [showShopName, setShowShopName] = useState(true);
  const [customShopName, setCustomShopName] = useState('ISRAFIL BD SHOP');
  const [columnsLayout, setColumnsLayout] = useState('4'); // '4' (A4 24-up), '3' (A4 18-up), '2' (Shelf tags), '1' (Thermal roll)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products?per_page=1000');
        const list = res.data.data || [];
        setProducts(list);
        if (list.length > 0) {
          if (urlParamSearch.trim()) {
            const found = list.find(
              (p) =>
                String(p.barcode || '').trim() === urlParamSearch.trim() ||
                (p.name && p.name.toLowerCase().includes(urlParamSearch.toLowerCase()))
            );
            setSelectedProduct(found || list[0]);
          } else {
            setSelectedProduct(list[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [lang, urlParamSearch]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.name_bn && p.name_bn.toLowerCase().includes(q)) ||
        (p.barcode && String(p.barcode).toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  // Determine grid columns classes for screen preview and print mode
  const getGridClasses = () => {
    switch (columnsLayout) {
      case '1':
        return 'grid-cols-1 max-w-sm mx-auto print:grid-cols-1 print:max-w-none';
      case '2':
        return 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2';
      case '3':
        return 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3';
      case '4':
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-4';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Barcode className="w-7 h-7 text-indigo-600" />
            {t('barcodeGenerator')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'পণ্যের জন্য স্ক্যানযোগ্য বারকোড ও মূল্য স্টিকার তৈরি ও সরাসরি প্রিন্ট করুন'
              : 'Generate and print thermal barcode labels and price stickers'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={!selectedProduct}
          className="py-2.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md flex items-center gap-2 self-start transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{lang === 'bn' ? 'বারকোড স্টিকার প্রিন্ট করুন' : 'Print Barcode Stickers'}</span>
        </button>
      </div>

      {/* Controls Card (Hidden during print) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4 no-print">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Settings2 className="w-4 h-4 text-indigo-500" />
          <span>{lang === 'bn' ? 'স্টিকার ও প্রিন্টার কনফিগারেশন' : 'Label & Printer Settings'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Product Search & Dropdown */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{lang === 'bn' ? 'পণ্য নির্বাচন করুন *' : 'Select Product *'}</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({filteredProducts.length} {lang === 'bn' ? 'টি পাওয়া গেছে' : 'found'})
              </span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'পণ্য বা বারকোড খুঁজুন...' : 'Search product or barcode...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <select
                value={selectedProduct ? selectedProduct.id : ''}
                onChange={(e) => {
                  const p = products.find((x) => x.id === Number(e.target.value));
                  setSelectedProduct(p || null);
                }}
                className="w-1/2 py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {lang === 'bn' ? (p.name_bn || p.name) : p.name} ({p.barcode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'স্টিকার সংখ্যা (Quantity)' : 'Label Quantity'}
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Sheet Layout */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'শিট লেআউট (Sheet Layout)' : 'Sheet Layout'}
            </label>
            <select
              value={columnsLayout}
              onChange={(e) => setColumnsLayout(e.target.value)}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="4">{lang === 'bn' ? 'A4 - ৪ কলাম (২৪ স্টিকার/পেজ)' : 'A4 - 4 Columns (24/page)'}</option>
              <option value="3">{lang === 'bn' ? 'A4 - ৩ কলাম (১৮ স্টিকার/পেজ)' : 'A4 - 3 Columns (18/page)'}</option>
              <option value="2">{lang === 'bn' ? '২ কলাম (শেল্ফ ট্যাগ / বড়)' : '2 Columns (Shelf Tags)'}</option>
              <option value="1">{lang === 'bn' ? '১ কলাম (থার্মাল রোল ৫০x৩০ মিমি)' : '1 Column (Thermal 50x30mm)'}</option>
            </select>
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-medium text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showShopName}
              onChange={(e) => setShowShopName(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span>{lang === 'bn' ? 'দোকানের নাম দেখান' : 'Show Shop Name'}</span>
          </label>

          {showShopName && (
            <input
              type="text"
              value={customShopName}
              onChange={(e) => setCustomShopName(e.target.value)}
              placeholder="Shop Name"
              className="py-1 px-2.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-48 font-bold"
            />
          )}

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPrice}
              onChange={(e) => setShowPrice(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span>{lang === 'bn' ? 'বিক্রয় মূল্য প্রদর্শন করুন' : 'Show Retail Price'}</span>
          </label>
        </div>
      </div>

      {/* Barcode Stickers Printable Sheet */}
      {selectedProduct ? (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card print:p-0 print:border-none print:shadow-none print:bg-transparent">
          <div className="flex items-center justify-between mb-6 no-print">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{lang === 'bn' ? 'লাইভ প্রিন্ট প্রিভিউ (Print Sheet Preview):' : 'Live Print Sheet Preview:'}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {quantity} {lang === 'bn' ? 'টি স্টিকার তৈরি হচ্ছে' : 'labels generated'}
            </span>
          </div>

          {/* Printable Area Target with Explicit ID */}
          <div id="printable-area">
            <div className={`grid gap-3 print:gap-2.5 ${getGridClasses()}`}>
              {Array.from({ length: quantity }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 border border-dashed border-slate-300 dark:border-slate-700 print:border-slate-900 print:border-solid rounded-xl text-center bg-white text-black flex flex-col items-center justify-between shadow-sm page-break-inside-avoid break-inside-avoid min-h-[125px]"
                >
                  {/* Shop Name */}
                  {showShopName && (
                    <div className="text-[10px] font-black tracking-tight uppercase text-black line-clamp-1 w-full pb-0.5">
                      {customShopName || 'ISRAFIL BD SHOP'}
                    </div>
                  )}

                  {/* Product Title */}
                  <div className="text-[11px] font-bold line-clamp-1 w-full text-black px-1">
                    {lang === 'bn' ? (selectedProduct.name_bn || selectedProduct.name) : selectedProduct.name}
                  </div>

                  {/* High Quality Code 128 Vector SVG Barcode */}
                  <div className="my-1.5 w-full flex flex-col items-center px-1">
                    <BarcodeSvg code={selectedProduct.barcode} height={36} />
                    <div className="font-mono text-[10px] font-bold tracking-widest text-black mt-0.5">
                      {selectedProduct.barcode}
                    </div>
                  </div>

                  {/* Price */}
                  {showPrice && (
                    <div className="text-xs font-black text-black border-t border-slate-200 print:border-black w-full pt-1">
                      {formatCurrency(selectedProduct.selling_price)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Barcode className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No Products Available'}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'bn'
              ? 'বারকোড জেনারেট করতে প্রথমে প্রোডাক্ট যোগ বা ইমপোর্ট করুন।'
              : 'Add or import products first to generate barcode labels.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeGenerator;
