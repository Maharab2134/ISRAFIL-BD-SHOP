import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';

export const Reports = () => {
  const { t, lang, formatCurrency, formatNumber } = useLanguage();
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'monthly', 'yearly', 'products', 'stock'
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());

  const [reportData, setReportData] = useState(null);
  const [productData, setProductData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [activeTab, reportDate, reportMonth, reportYear, lang]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (activeTab === 'daily') {
        const res = await api.get('/reports/daily', { params: { date: reportDate } });
        setReportData(res.data);
      } else if (activeTab === 'monthly') {
        const res = await api.get('/reports/monthly', { params: { month: reportMonth } });
        setReportData(res.data);
      } else if (activeTab === 'yearly') {
        const res = await api.get('/reports/yearly', { params: { year: reportYear } });
        setReportData(res.data);
      } else if (activeTab === 'products') {
        const res = await api.get('/reports/products');
        setProductData(res.data.data || []);
      } else if (activeTab === 'stock') {
        const res = await api.get('/reports/stock');
        setStockData(res.data.data || []);
      }
    } catch (e) {
      error(lang === 'bn' ? 'রিপোর্ট লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (activeTab === 'products') {
      let csv = 'Product Name,Barcode,Units Sold,Revenue (BDT),COGS (BDT),Estimated Profit (BDT)\n';
      productData.forEach((p) => {
        csv += `"${p.product_name}","${p.product_code}",${p.units_sold},${p.revenue},${p.total_cogs},${p.estimated_profit}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `israfil_products_report_${reportDate}.csv`);
      link.click();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            {t('reports')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'দোকানের দৈনিক, মাসিক, পণ্যভিত্তিক বিক্রয় ও স্টক মূল্যায়ন বিশ্লেষণ'
              : 'Daily, monthly, yearly, product performance, and stock audit reports'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => window.print()}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রিন্ট রিপোর্ট' : 'Print Report'}</span>
          </button>
          <button
            onClick={exportCSV}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-print">
        {[
          { key: 'daily', bn: 'দৈনিক রিপোর্ট', en: 'Daily Summary' },
          { key: 'monthly', bn: 'মাসিক রিপোর্ট', en: 'Monthly Summary' },
          { key: 'yearly', bn: 'বাৎসরিক রিপোর্ট', en: 'Yearly Summary' },
          { key: 'products', bn: 'পণ্যভিত্তিক বিক্রয় ও লাভ', en: 'Product Performance' },
          { key: 'stock', bn: 'স্টক মূল্যায়ন রিপোর্ট', en: 'Stock Valuation' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {lang === 'bn' ? tab.bn : tab.en}
          </button>
        ))}
      </div>

      {/* Date Filters according to activeTab */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex items-center gap-3 no-print">
        {activeTab === 'daily' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{lang === 'bn' ? 'তারিখ নির্বাচন:' : 'Select Date:'}</span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{lang === 'bn' ? 'মাস নির্বাচন:' : 'Select Month:'}</span>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>
        )}

        {activeTab === 'yearly' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{lang === 'bn' ? 'বছর নির্বাচন:' : 'Select Year:'}</span>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Daily/Monthly/Yearly Summary Cards */}
      {['daily', 'monthly', 'yearly'].includes(activeTab) && reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs text-slate-500 font-semibold">{lang === 'bn' ? 'মোট বিক্রয় বিলিং' : 'Gross Sales'}</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(reportData.total_sales || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {reportData.sales_count || 0} {lang === 'bn' ? 'টি চালান' : 'invoices'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs text-slate-500 font-semibold">{lang === 'bn' ? 'নগদ আদায় (Cash Collection)' : 'Cash Collected'}</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(reportData.cash_collected || 0)}
              </div>
              <span className="text-[11px] text-emerald-500 mt-1 block font-semibold">{lang === 'bn' ? 'হাতে নগদ জমা' : 'Net received in drawer'}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs text-slate-500 font-semibold">{lang === 'bn' ? 'বকেয়া বিক্রয় (Due Sales)' : 'Credit / Due Sales'}</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(reportData.due_sales || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">{lang === 'bn' ? 'পরবর্তীতে আদায়যোগ্য' : 'Receivable'}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs text-slate-500 font-semibold">{lang === 'bn' ? 'মোট খরচ (Expenses)' : 'Total Expenses'}</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(reportData.total_expenses || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">{lang === 'bn' ? 'পরিচালন ব্যয়' : 'Operating overhead'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Products Performance Table */}
      {activeTab === 'products' && (
        <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                  <th className="p-4">{lang === 'bn' ? 'বারকোড' : 'Barcode'}</th>
                  <th className="p-4 text-center">{lang === 'bn' ? 'বিক্রিত একক' : 'Units Sold'}</th>
                  <th className="p-4 text-right">{lang === 'bn' ? 'মোট বিক্রয়' : 'Sales Revenue'}</th>
                  <th className="p-4 text-right">{lang === 'bn' ? 'পণ্য কেনা খরচ (COGS)' : 'Product COGS'}</th>
                  <th className="p-4 text-right">{lang === 'bn' ? 'অর্জিত লাভ (Profit)' : 'Realized Profit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">{t('loading')}</td></tr>
                ) : productData.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">{t('noData')}</td></tr>
                ) : (
                  productData.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{p.product_name}</td>
                      <td className="p-4 font-mono text-slate-500">{p.product_code}</td>
                      <td className="p-4 text-center font-bold text-indigo-600">{p.units_sold}</td>
                      <td className="p-4 text-right font-semibold">{formatCurrency(p.revenue)}</td>
                      <td className="p-4 text-right text-slate-500">{formatCurrency(p.total_cogs)}</td>
                      <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.estimated_profit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Audit Table */}
      {activeTab === 'stock' && (
        <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                  <th className="p-4">{lang === 'bn' ? 'বারকোড' : 'Barcode'}</th>
                  <th className="p-4 text-center">{lang === 'bn' ? 'বর্তমান মজুদ' : 'Current Stock'}</th>
                  <th className="p-4 text-right">{lang === 'bn' ? 'একক ক্রয়মূল্য' : 'Unit Cost'}</th>
                  <th className="p-4 text-right">{lang === 'bn' ? 'একক বিক্রয়মূল্য' : 'Selling Price'}</th>
                  <th className="p-4 text-right">{lang === 'bn' ? 'মোট মজুদ মূল্য (COGS)' : 'Total Stock Cost'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">{t('loading')}</td></tr>
                ) : stockData.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">{t('noData')}</td></tr>
                ) : (
                  stockData.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                      <td className="p-4 font-mono text-slate-500">{s.barcode}</td>
                      <td className="p-4 text-center font-bold text-indigo-600">{s.current_stock}</td>
                      <td className="p-4 text-right">{formatCurrency(s.purchase_price)}</td>
                      <td className="p-4 text-right font-semibold">{formatCurrency(s.selling_price)}</td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(s.total_cost)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
