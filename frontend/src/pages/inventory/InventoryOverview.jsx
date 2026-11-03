import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Boxes,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  XCircle,
  PackageCheck,
  Sliders,
  History,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';

export const InventoryOverview = () => {
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, prodRes] = await Promise.all([
          api.get('/inventory/overview'),
          api.get('/products?low_stock=1&per_page=15'),
        ]);
        setOverview(ovRes.data);
        setLowStockProducts(prodRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lang]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-indigo-600" />
            {t('stockOverview')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'দোকানের মজুদ পণ্যের মোট মূল্য ও ইনভেন্টরি স্থিতি'
              : 'Current stock valuation, inventory metrics, and asset health'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/inventory/adjustment"
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition"
          >
            <Sliders className="w-4 h-4" />
            <span>{t('stockAdjustment')}</span>
          </Link>
          <Link
            to="/inventory/history"
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition"
          >
            <History className="w-4 h-4" />
            <span>{t('stockHistory')}</span>
          </Link>
        </div>
      </div>

      {/* 5 Stock Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'মোট মজুদ পণ্য' : 'Total Stock Units'}</span>
            <Boxes className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2">
            {formatNumber(overview?.total_quantity)} {lang === 'bn' ? 'টি' : 'units'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {formatNumber(overview?.total_items)} {lang === 'bn' ? 'টি ভিন্ন আইটেম' : 'distinct items'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'স্টক ক্রয়মূল্য (কেনা দর)' : 'Cost Valuation (COGS)'}</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(overview?.stock_cost_value)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {lang === 'bn' ? 'ইনভেন্টরি ইনভেস্টমেন্ট' : 'Total capital tied in stock'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'খুচরা বিক্রয়মূল্য' : 'Retail Sales Value'}</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(overview?.stock_retail_value)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            +{formatCurrency(overview?.expected_margin)} {lang === 'bn' ? 'সম্ভাব্য লাভ' : 'expected profit'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'স্বল্প স্টক সতর্কতা' : 'Low Stock Alerts'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatNumber(overview?.low_stock_count)} {lang === 'bn' ? 'টি পণ্য' : 'products'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {lang === 'bn' ? 'শীঘ্রই রি-অর্ডার প্রয়োজন' : 'Requires immediate reorder'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'স্টক শূন্য (Out of Stock)' : 'Out of Stock'}</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatNumber(overview?.out_of_stock_count)} {lang === 'bn' ? 'টি পণ্য' : 'products'}
          </div>
          <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
            {lang === 'bn' ? 'বিক্রয় বন্ধ' : 'Unavailable for POS sale'}
          </span>
        </div>
      </div>

      {/* Low Stock Watchlist */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>{lang === 'bn' ? 'স্বল্প স্টক পণ্য তালিকা (Low Stock Warnings)' : 'Low Stock Warning Watchlist'}</span>
          </h2>
          <Link
            to="/products?low_stock=1"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{lang === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                <th className="p-3">{lang === 'bn' ? 'বারকোড' : 'Barcode'}</th>
                <th className="p-3 text-center">{lang === 'bn' ? 'বর্তমান স্টক' : 'Current Stock'}</th>
                <th className="p-3 text-center">{lang === 'bn' ? 'সতর্কতা লেভেল' : 'Alert Level'}</th>
                <th className="p-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">
                    {lang === 'bn' ? 'সব পণ্যের মজুদ পর্যাপ্ত রয়েছে!' : 'All product inventory levels are healthy!'}
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {lang === 'bn' ? (p.name_bn || p.name) : p.name}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{p.barcode}</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {p.current_stock} {lang === 'bn' ? (p.unit?.name_bn || 'পিস') : (p.unit?.name || 'pcs')}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-500">
                      {p.alert_stock} {lang === 'bn' ? (p.unit?.name_bn || 'পিস') : (p.unit?.name || 'pcs')}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/inventory/adjustment?product_id=${p.id}`}
                        className="py-1 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition text-[11px]"
                      >
                        {lang === 'bn' ? 'স্টক যোগ করুন' : 'Adjust Stock'}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;
