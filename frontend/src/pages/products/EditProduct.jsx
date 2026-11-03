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
} from 'lucide-react';
import api from '../../services/api';

export const EditProduct = () => {
  const { id } = useParams();
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
        setAlertStock(p.alert_stock);
        setTaxPercent(p.tax_percent);
        setStatus(p.status);
        setDescription(p.description || '');
        setImagePreview(p.image_url);
      } catch (e) {
        error('পণ্যের তথ্য লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
      formData.append('alert_stock', alertStock);
      formData.append('tax_percent', taxPercent);
      formData.append('status', status);
      if (description) formData.append('description', description);
      if (imageFile) formData.append('image', imageFile);

      await api.post(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('পণ্যের তথ্য সফলভাবে আপডেট হয়েছে!');
      navigate('/products');
    } catch (err) {
      const msg = err.response?.data?.message || 'পণ্য আপডেট করতে সমস্যা হয়েছে।';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              পণ্য সম্পাদনা করুন
            </h1>
            <p className="text-xs text-slate-500">ID #{id} • {name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">নাম (English) *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">নাম (বাংলা)</label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">বারকোড *</label>
            <input
              type="text"
              required
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ক্যাটাগরি *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ব্র্যান্ড</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">ব্র্যান্ড নির্বাচন করুন</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name_bn || b.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">পরিমাপক একক *</label>
            <select
              required
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name_bn || u.name} ({u.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">অবস্থা (Status) *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="active">সক্রিয় (Active)</option>
              <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">কেনা মূল্য (৳) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">বিক্রয় মূল্য (৳) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-bold text-indigo-600 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">সতর্কতা স্টক লেভেল</label>
            <input
              type="number"
              value={alertStock}
              onChange={(e) => setAlertStock(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ভ্যাট / ট্যাক্স (%)</label>
            <input
              type="number"
              step="0.1"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">পণ্যের ছবি পরিবর্তন</label>
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
              className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>

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
            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

