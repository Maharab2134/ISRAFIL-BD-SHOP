import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  ArrowLeft,
  Upload,
  Barcode,
  Save,
  Check,
  Tag,
  Percent,
} from 'lucide-react';
import api from '../../services/api';

export const EditProduct = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [discountType, setDiscountType] = useState('none'); // 'none' | 'fixed' | 'percentage'
  const [discountValue, setDiscountValue] = useState('');
  const [alertStock, setAlertStock] = useState('5');
  const [taxPercent, setTaxPercent] = useState('0');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, brandsRes, unitsRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/units'),
          api.get(`/products/${id}`),
        ]);

        setCategories(catsRes.data || []);
        setBrands(brandsRes.data || []);
        setUnits(unitsRes.data || []);

        const p = prodRes.data;
        setName(p.name);
        setNameBn(p.name_bn || '');
        setBarcode(p.barcode);
        setSku(p.sku);
        setCategoryId(p.category_id);
        setBrandId(p.brand_id || '');
        setUnitId(p.unit_id);
        setPurchasePrice(p.purchase_price);
        setSellingPrice(p.selling_price);
        setWholesalePrice(p.wholesale_price || '');
        setDiscountType(p.discount_type || 'none');
        setDiscountValue(p.discount_value && Number(p.discount_value) > 0 ? String(Number(p.discount_value)) : '');
        setAlertStock(p.alert_stock);
        setTaxPercent(p.tax_percent);
        setStatus(p.status);
        setDescription(p.description || '');
        setImagePreview(p.image_url);
      } catch (e) {
        error(lang === 'bn' ? 'পণ্যের তথ্য লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, lang]);

  const calculateDiscountPreview = () => {
    const sp = parseFloat(sellingPrice) || 0;
    const dv = parseFloat(discountValue) || 0;
    if (discountType === 'percentage' && dv > 0) {
      const discountAmt = (sp * dv) / 100;
      return {
        amount: discountAmt,
        finalPrice: Math.max(0, sp - discountAmt),
        text: `${dv}% (${lang === 'bn' ? 'সাশ্রয় ৳' : 'Save ৳'}${discountAmt.toFixed(2)})`,
      };
    }
    if (discountType === 'fixed' && dv > 0) {
      const discountAmt = Math.min(sp, dv);
      return {
        amount: discountAmt,
        finalPrice: Math.max(0, sp - discountAmt),
        text: `৳${discountAmt.toFixed(2)}`,
      };
    }
    return { amount: 0, finalPrice: sp, text: '৳0.00' };
  };

  const discountPreview = calculateDiscountPreview();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', name);
      if (nameBn) formData.append('name_bn', nameBn);
      formData.append('barcode', barcode);
      formData.append('sku', sku || barcode);
      formData.append('category_id', categoryId);
      if (brandId) formData.append('brand_id', brandId);
      formData.append('unit_id', unitId);
      formData.append('purchase_price', purchasePrice);
      formData.append('selling_price', sellingPrice);
      if (wholesalePrice) formData.append('wholesale_price', wholesalePrice);
      if (discountType !== 'none' && Number(discountValue) > 0) {
        formData.append('discount_type', discountType);
        formData.append('discount_value', discountValue);
      } else {
        formData.append('discount_type', 'fixed');
        formData.append('discount_value', 0);
      }
      formData.append('alert_stock', alertStock);
      formData.append('tax_percent', taxPercent);
      formData.append('status', status);
      if (description) formData.append('description', description);
      if (imageFile) formData.append('image', imageFile);

      await api.post(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success(lang === 'bn' ? 'পণ্যের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Product updated successfully!');
      navigate('/products');
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'পণ্য আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update product.');
      error(msg);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {lang === 'bn' ? 'পণ্য সম্পাদন করুন' : 'Edit Product'}
            </h1>
            <p className="text-xs text-slate-500">ID #{id} • {name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'পণ্যের নাম (English) *' : 'Product Name (English) *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'পণ্যের নাম (বাংলা)' : 'Product Name (Bangla)'}
            </label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'বারকোড *' : 'Barcode *'}
            </label>
            <input
              type="text"
              required
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'ক্যাটাগরি *' : 'Category *'}
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'bn' ? c.name_bn || c.name : c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'ব্র্যান্ড' : 'Brand'}
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{lang === 'bn' ? 'ব্র্যান্ড নির্বাচন করুন' : 'Select Brand (Optional)'}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {lang === 'bn' ? b.name_bn || b.name : b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'পরিমাপক একক *' : 'Measurement Unit *'}
            </label>
            <select
              required
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {lang === 'bn' ? u.name_bn || u.name : u.name} ({u.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('status')} *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'ক্রয় মূল্য (৳) *' : 'Purchase Price (৳) *'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'বিক্রয় মূল্য (৳) *' : 'Selling Price (৳) *'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-bold text-indigo-600 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Product Auto Discount Section */}
          <div className="col-span-full rounded-2xl p-4 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-indigo-50/40 dark:from-emerald-950/25 dark:via-teal-950/20 dark:to-indigo-950/15 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{lang === 'bn' ? 'পণ্য ভিত্তিক বিশেষ ছাড় (POS Auto Discount)' : 'Product Discount (POS Auto Discount)'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                      {lang === 'bn' ? 'পিওএস-এ অটো অ্যাপ্লাই' : 'Auto in POS'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'bn'
                      ? 'এখানে ছাড় নির্ধারণ করলে পিওএস টার্মিনালে পণ্যটি স্ক্যান বা সিলেক্ট করলেই স্বয়ংক্রিয়ভাবে ছাড়টি যুক্ত হবে।'
                      : 'Setting a discount here will automatically apply it in POS Terminal whenever this product is selected or scanned.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {/* Discount Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'ছাড়ের ধরন (Discount Type)' : 'Discount Type'}
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="none">{lang === 'bn' ? 'কোনো ছাড় নেই (No Discount)' : 'No Discount'}</option>
                  <option value="percentage">{lang === 'bn' ? 'শতকরা ছাড় (% Percentage)' : 'Percentage (%)'}</option>
                  <option value="fixed">{lang === 'bn' ? 'নির্দিষ্ট টাকা (Fixed ৳)' : 'Fixed Amount (৳)'}</option>
                </select>
              </div>

              {/* Discount Value */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {discountType === 'percentage'
                    ? (lang === 'bn' ? 'ছাড়ের শতকরা হার (%)' : 'Discount Rate (%)')
                    : (lang === 'bn' ? 'ছাড়ের পরিমাণ (৳)' : 'Discount Amount (৳)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  disabled={discountType === 'none'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'e.g. 10%' : 'e.g. 50 ৳'}
                  className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Live Preview Card */}
              <div className="space-y-1 flex flex-col justify-end">
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-700/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                      {lang === 'bn' ? 'পিওএস ফাইনাল বিক্রয়মূল্য' : 'POS Effective Price'}
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ৳{discountPreview.finalPrice.toFixed(2)}
                    </span>
                  </div>
                  {discountType !== 'none' && Number(discountValue) > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        -{discountPreview.text}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        ৳{parseFloat(sellingPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'সতর্কতা স্টক লেভেল' : 'Alert Stock Level'}
            </label>
            <input
              type="number"
              value={alertStock}
              onChange={(e) => setAlertStock(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'ভ্যাট / ট্যাক্স (%)' : 'VAT / Tax (%)'}
            </label>
            <input
              type="number"
              step="0.1"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {lang === 'bn' ? 'পণ্যের ছবি পরিবর্তন' : 'Change Product Image'}
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link
            to="/products"
            className="py-2.5 px-5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting
                ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Saving...')
                : (lang === 'bn' ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default EditProduct;
