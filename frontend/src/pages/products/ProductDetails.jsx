import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  ArrowLeft,
  Edit,
  Barcode,
  TrendingUp,
  Tag,
  Layers,
  History,
  ShoppingCart,
  Plus,
  Printer,
} from 'lucide-react';
import api from '../../services/api';
import { normalizeImageUrl } from '../../utils/imageHelper';
import { BarcodeSvg } from '../../components/common/BarcodeSvg';
import { ProductCardMedia } from '../../components/common/ProductCardMedia';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { error, success } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fromPos = location.state?.from === 'pos';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        error(lang === 'bn' ? 'পণ্যের তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, lang]);

  const handleAddToCartAndGoPos = () => {
    if (!product) return;
    try {
      const saved = sessionStorage.getItem('israfil_pos_cart');
      const cart = saved ? JSON.parse(saved) : [];
      const sp = Number(product.selling_price) || 0;
      let unitDiscount = 0;
      if (product.discount_type === 'percentage') {
        unitDiscount = (sp * (Number(product.discount_value) || 0)) / 100;
      } else if (product.discount_type === 'fixed') {
        unitDiscount = Math.min(sp, Number(product.discount_value) || 0);
      }

      const existingIndex = cart.findIndex((i) => i.product_id === product.id);
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
        cart[existingIndex].discount_amount = (cart[existingIndex].unit_discount || 0) * cart[existingIndex].quantity;
      } else {
        cart.push({
          product_id: product.id,
          name: product.name,
          name_bn: product.name_bn,
          barcode: product.barcode,
          unit_price: sp,
          purchase_price: Number(product.purchase_price),
          tax_percent: Number(product.tax_percent || 0),
          unit: lang === 'bn' ? (product.unit?.name_bn || 'পিস') : (product.unit?.name || 'pcs'),
          quantity: 1,
          discount_type: product.discount_type || 'fixed',
          discount_value: Number(product.discount_value) || 0,
          unit_discount: unitDiscount,
          discount_amount: unitDiscount * 1,
          has_discount: unitDiscount > 0,
          discount_badge: product.discount_type === 'percentage' ? `-${product.discount_value}%` : (unitDiscount > 0 ? `-৳${product.discount_value}` : null),
          current_stock: Number(product.current_stock),
          image_url: product.image_url,
        });
      }
      sessionStorage.setItem('israfil_pos_cart', JSON.stringify(cart));
      success(lang === 'bn' ? `'${product.name}' কার্টে যোগ করা হয়েছে` : `'${product.name}' added to POS cart`);
      navigate('/pos');
    } catch (e) {
      navigate('/pos');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-rose-500 font-semibold">
        {lang === 'bn' ? 'পণ্যটি খুঁজে পাওয়া যায়নি।' : 'Product not found.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate(fromPos ? '/pos' : '/products');
              }
            }}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer shadow-xs active:scale-95"
            title={fromPos ? (lang === 'bn' ? 'পিওএস-এ ফিরুন' : 'Back to POS') : (lang === 'bn' ? 'পিছনে যান' : 'Go back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {product.name}
              </h1>
              {fromPos && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  POS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {product.name_bn ? `${product.name_bn} • ` : ''}SKU: {product.sku}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Back to POS Button */}
          <Link
            to="/pos"
            className="py-2 px-3.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'bn' ? 'পিওএস টার্মিনাল' : 'POS Terminal'}</span>
          </Link>

          {/* Add to POS Cart & Return */}
          <button
            type="button"
            onClick={handleAddToCartAndGoPos}
            className="py-2 px-3.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            title={lang === 'bn' ? 'কার্টে যোগ করে পিওএস টার্মিনালে যান' : 'Add to cart & go to POS'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'কার্টে যোগ করুন (+১)' : 'Add to Cart (+1)'}</span>
          </button>

          <Link
            to={`/products/${product.id}/edit`}
            className="py-2 px-3.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>{t('edit')}</span>
          </Link>
        </div>
      </div>

      {/* Main Specs Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Product Image & Barcode Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col items-center text-center space-y-4">
          <div className="w-52 h-52 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex items-center justify-center p-2">
            <ProductCardMedia
              product={product}
              className="w-full h-full"
            />
          </div>

          {/* Vector Barcode Display */}
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'bn' ? 'পণ্য বারকোড' : 'Product Barcode'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title={lang === 'bn' ? 'সরাসরি প্রিন্ট করুন' : 'Print directly'}
                >
                  <Printer className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <Link
                  to={`/products/barcode-generator?search=${encodeURIComponent(product.barcode)}`}
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:underline flex items-center gap-1"
                  title={lang === 'bn' ? 'বারকোড স্টিকার শিট জেনারেটর' : 'Barcode Sticker Sheet Generator'}
                >
                  <Barcode className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'স্টিকার শিট' : 'Stickers'}</span>
                </Link>
              </div>
            </div>

            <div id="product-barcode-card" className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col items-center justify-center space-y-1.5">
              <div className="w-full bg-white p-2 rounded-xl flex items-center justify-center">
                <BarcodeSvg
                  code={product.barcode}
                  height={46}
                  className="w-full max-w-[220px] h-12 mx-auto"
                />
              </div>
              <div className="font-mono text-sm font-black text-slate-900 dark:text-white tracking-widest pt-1">
                {product.barcode}
              </div>
            </div>
          </div>
        </div>

        {/* Right (2 cols): Details and Financials */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'bn' ? 'বর্তমান স্টক' : 'Current Stock'}
              </span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {product.current_stock} {lang === 'bn' ? (product.unit?.name_bn || 'পিস') : (product.unit?.name || 'pcs')}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'bn' ? 'ক্রয় মূল্য' : 'Cost Price'}
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(product.purchase_price)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'bn' ? 'বিক্রয় মূল্য ও ডিসকাউন্ট' : 'Selling Price & Discount'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-emerald-600">
                  {product.discount_type && Number(product.discount_value) > 0
                    ? formatCurrency(
                        product.discount_type === 'percentage'
                          ? Math.max(0, product.selling_price - (product.selling_price * product.discount_value) / 100)
                          : Math.max(0, product.selling_price - product.discount_value)
                      )
                    : formatCurrency(product.selling_price)}
                </span>
                {product.discount_type && Number(product.discount_value) > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(product.selling_price)}
                  </span>
                )}
              </div>
              {product.discount_type && Number(product.discount_value) > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-[10px]">
                  🏷️ {lang === 'bn' ? 'পিওএস স্বয়ংক্রিয় ছাড়:' : 'POS Auto Discount:'} {product.discount_type === 'percentage' ? `${product.discount_value}%` : `৳${product.discount_value}`}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'bn' ? 'প্রত্যাশিত মুনাফা/পিস' : 'Unit Profit Margin'}
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(product.selling_price - product.purchase_price)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'bn' ? 'ভ্যাট / ট্যাক্স হার' : 'VAT / Tax Rate'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-base font-bold ${Number(product.tax_percent) > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {Number(product.tax_percent || 0)}%
                </span>
                {Number(product.tax_percent) > 0 && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    (+{formatCurrency((product.selling_price * product.tax_percent) / 100)})
                  </span>
                )}
              </div>
              {Number(product.tax_percent) > 0 && (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-medium mt-0.5">
                  {lang === 'bn' ? 'পিওএস-এ ভ্যাটসহ মোট:' : 'With VAT in POS:'} {formatCurrency(Number(product.selling_price) * (1 + Number(product.tax_percent) / 100))}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'bn' ? (product.category?.name_bn || product.category?.name) : product.category?.name}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'bn' ? 'ব্র্যান্ড' : 'Brand'}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'bn' ? (product.brand?.name_bn || product.brand?.name || '—') : (product.brand?.name || '—')}
              </span>
            </div>
          </div>

          {product.description && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'বিবরণ' : 'Description'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Movement Ledger Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'স্টক চলাচলের ইতিহাস (Stock Ledger)' : 'Stock Movement Ledger'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">{t('date')}</th>
                <th className="p-3">{lang === 'bn' ? 'লেনদেনের ধরন' : 'Type'}</th>
                <th className="p-3 text-right">{lang === 'bn' ? 'আগের স্টক' : 'Stock Before'}</th>
                <th className="p-3 text-center">{lang === 'bn' ? 'পরিমাণ' : 'Quantity'}</th>
                <th className="p-3 text-right">{lang === 'bn' ? 'পরবর্তী স্টক' : 'Stock After'}</th>
                <th className="p-3">{lang === 'bn' ? 'কারণ / রেফারেন্স' : 'Reason / Reference'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {product.stock_movements?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    {lang === 'bn' ? 'এখনও কোনো স্টক রেকর্ড পাওয়া যায়নি।' : 'No stock records found yet.'}
                  </td>
                </tr>
              ) : (
                product.stock_movements?.map((m) => {
                  const isPositive = Number(m.quantity) >= 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-slate-500 font-mono">
                        {new Date(m.created_at).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </td>
                      <td className="p-3 font-semibold capitalize text-slate-700 dark:text-slate-300">
                        {m.movement_type}
                      </td>
                      <td className="p-3 text-right">{m.stock_before}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-lg ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                          }`}
                        >
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        {m.stock_after}
                      </td>
                      <td className="p-3 text-slate-500">{m.reason || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ProductDetails;
