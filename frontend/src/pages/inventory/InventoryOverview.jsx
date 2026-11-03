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
  const { t, formatCurrency, formatNumber } = useLanguage();
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
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('stockOverview')}
          </h1>
          <p className="text-sm text-slate-500">দোকানের মজুদ পণ্যের মোট মূল্য ও ইনভেন্টরি স্থিতি</p>
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
            <span className="text-xs font-semibold">মোট মজুদ পণ্য</span>
            <Boxes className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2">
            {formatNumber(overview?.total_quantity)} টি
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {formatNumber(overview?.total_items)} টি ভিন্ন আইটেম
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">স্টক ক্রয়মূল্য (কেনা দর)</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(overview?.stock_cost_value)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">ইনভেন্টরি ইনভেস্টমেন্ট</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">প্রত্যাশিত বিক্রয়মূল্য</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(overview?.stock_sale_value)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">বর্তমান বিক্রয় দর অনুযায়ী</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">সম্ভাব্য মোট লাভ</span>
            <PackageCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(overview?.potential_profit)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">সম্পূর্ণ বিক্রয়ে প্রত্যাশিত লাভ</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">সতর্কতা / শেষ স্টক</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-600 mt-2">
            {formatNumber(overview?.low_stock_count)} টি
          </div>
          <span className="text-[11px] text-rose-500 font-medium mt-1 block">
            শূন্য স্টক: {formatNumber(overview?.out_of_stock_count)} টি
          </span>
        </div>
      </div>

      {/* Low Stock Items Detailed Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              অবিলম্বে রি-অর্ডার ও স্টক সমন্বয় প্রয়োজন এমন পণ্য
            </h2>
            <p className="text-xs text-slate-500">স্টক সতর্কতা মাত্রার সমান বা তার নিচে চলে গেছে</p>
          </div>
          <Link
            to="/purchases/new"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>সাপ্লায়ার অর্ডার করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-3.5">পণ্য</th>
                <th className="p-3.5">বারকোড</th>
                <th className="p-3.5 text-center">বর্তমান স্টক</th>
                <th className="p-3.5 text-center">সতর্কতা মাত্রা</th>
                <th className="p-3.5 text-right">ক্রয় মূল্য</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    বর্তমানে কোনো পণ্যের স্টক কম নেই।
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {prod.name}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{prod.barcode}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {prod.current_stock} {prod.unit?.name_bn}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-500">{prod.alert_stock}</td>
                    <td className="p-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(prod.purchase_price)}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/inventory/adjustment?product_id=${prod.id}`}
                        className="py-1 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition inline-block"
                      >
                        স্টক সমন্বয়
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
