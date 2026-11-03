import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  ArrowLeft,
  Upload,
  Barcode,
  Save,
  Check,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

export const AddProduct = () => {
  const { t } = useLanguage();
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
  const [currentStock, setCurrentStock] = useState('0');
  const [alertStock, setAlertStock] = useState('5');
  const [taxPercent, setTaxPercent] = useState('0');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, brandsRes, unitsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/units'),
        ]);
        setCategories(catsRes.data || []);
        setBrands(brandsRes.data || []);
        setUnits(unitsRes.data || []);
        if (unitsRes.data?.length > 0) {
          setUnitId(unitsRes.data[0].id);
        }
      } catch (e) {
        error('মেটাডেটা লোড করতে সমস্যা হয়েছে।');
      }
    };
    fetchMetadata();
  }, []);

  const generateBarcode = () => {
    const randomBarcode = '894' + Math.floor(100000000 + Math.random() * 900000000);
    setBarcode(randomBarcode);
    if (!sku) {
      setSku('SKU-' + Math.floor(1000 + Math.random() * 9000));
    }
  };

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
      formData.append('current_stock', currentStock);
      formData.append('alert_stock', alertStock);
      formData.append('tax_percent', taxPercent);
      if (description) formData.append('description', description);
      if (imageFile) formData.append('image', imageFile);

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('নতুন পণ্য সফলভাবে তৈরি হয়েছে!');
      navigate('/products');
    } catch (err) {
      const msg = err.response?.data?.message || 'পণ্য সংরক্ষণ করতে সমস্যা হয়েছে।';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('addProduct')}
            </h1>
            <p className="text-xs text-slate-500">দোকানের ক্যাটালগে নতুন আইটেম যুক্ত করুন</p>
          </div>
        </div>
      </div>

      {/* Main Dedicated Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name (English) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              পণ্যের নাম (English) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Bluetooth Earbuds"
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Name (Bangla) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              পণ্যের নাম (বাংলা)
            </label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="যেমন: ওয়্যারলেস ব্লুটুথ ইয়ারবাডস"
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Barcode with Auto-Generator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                বারকোড নম্বর *
              </label>
              <button
                type="button"
                onClick={generateBarcode}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>অটো বারকোড তৈরি</span>
              </button>
            </div>
            <div className="relative">
              <Barcode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="যেমন: 894110001001"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              SKU কোড
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. EAR-BT-01"
              className="w-full py-2.5 px-3.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              ক্যাটাগরি *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">ক্যাটাগরি নির্বাচন করুন</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              ব্র্যান্ড
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">ব্র্যান্ড নির্বাচন করুন (ঐচ্ছিক)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name_bn || b.name}</option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              পরিমাপক একক *
            </label>
            <select
              required
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name_bn || u.name} ({u.code})</option>
              ))}
            </select>
          </div>

          {/* Purchase Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              কেনা মূল্য (Purchase Cost ৳) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="w-full py-2.5 px-3.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Selling Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              বিক্রয় মূল্য (Selling Price ৳) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0.00"
              className="w-full py-2.5 px-3.5 text-sm font-bold text-indigo-600 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Current Stock */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              উদ্বোধনী স্টক পরিমাণ
            </label>
            <input
              type="number"
              step="0.01"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Alert Stock */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              সতর্কতা স্টক লেভেল (Alert Level)
            </label>
            <input
              type="number"
              value={alertStock}
              onChange={(e) => setAlertStock(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            পণ্যের ছবি (Google Drive / ব্যাকএন্ড স্টোরেজ)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                সর্বোচ্চ ৫ মেগাবাইট (JPG, PNG, WEBP)
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            পণ্যের বিবরণ ও নোট
          </label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="পণ্যের গুণাগুণ ও অতিরিক্ত বিবরণ..."
            className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link
            to="/products"
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
            <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : t('save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

