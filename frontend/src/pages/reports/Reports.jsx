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
  const { t, formatCurrency, formatNumber } = useLanguage();
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
  }, [activeTab, reportDate, reportMonth, reportYear]);

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
      error('রিপোর্ট লোড করতে ব্যর্থ হয়েছে।');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('reports')}
          </h1>
          <p className="text-sm text-slate-500">
            দোকানের দৈনিক, মাসিক, পণ্যভিত্তিক বিক্রয় ও স্টক মূল্যায়ন বিশ্লেষণ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => window.print()}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট রিপোর্ট</span>
          </button>
          <button
            onClick={exportCSV}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 no-print">
        {[
          { id: 'daily', label: 'দৈনিক রিপোর্ট (Daily)' },
          { id: 'monthly', label: 'মাসিক রিপোর্ট (Monthly)' },
          { id: 'yearly', label: 'বার্ষিক রিপোর্ট (Yearly)' },
          { id: 'products', label: 'পণ্যভিত্তিক কার্যকারিতা' },
          { id: 'stock', label: 'ইনভেন্টরি স্টক মূল্যায়ন' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Pickers for Financial Tabs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex items-center gap-3 no-print">
        {activeTab === 'daily' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">তারিখ নির্বাচন:</span>
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
            <span className="text-xs font-semibold text-slate-500">মাস নির্বাচন:</span>
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
            <span className="text-xs font-semibold text-slate-500">সাল:</span>
            <input
              type="number"
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono w-24"
            />
          </div>
        )}
      </div>

      {/* Report Presentation Section */}
      <div id="printable-area" className="p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black text-indigo-700 dark:text-indigo-400">ISRAFIL BD SHOP</h2>
          <p className="text-xs text-slate-500">
            {activeTab === 'daily' && `দৈনিক আর্থিক প্রতিবেদন • ${reportDate}`}
            {activeTab === 'monthly' && `মাসিক আর্থিক প্রতিবেদন • ${reportMonth}`}
            {activeTab === 'yearly' && `বার্ষিক আর্থিক প্রতিবেদন • ${reportYear}`}
            {activeTab === 'products' && 'সর্বোচ্চ বিক্রিত পণ্য কার্যকারিতা বিশ্লেষণ'}
            {activeTab === 'stock' && 'দোকানের বর্তমান ইনভেন্টরি স্টক মূল্যায়ন'}
          </p>
        </div>

        {/* Financial Summary Presentation (Daily/Monthly/Yearly) */}
        {['daily', 'monthly', 'yearly'].includes(activeTab) && reportData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-xs text-slate-500">মোট বিক্রয় (Net Sales)</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(reportData.net_sales)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-xs text-slate-500">মালের ক্রয়মূল্য (COGS)</span>
                <div className="text-lg font-bold text-amber-600 mt-1">
                  {formatCurrency(reportData.total_cogs)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-xs text-slate-500">পরিচালন ব্যয় (Expenses)</span>
                <div className="text-lg font-bold text-rose-600 mt-1">
                  {formatCurrency(reportData.total_expenses)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">প্রকৃত নিট লাভ (Net Profit)</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(reportData.net_profit)}
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <table className="w-full text-left text-xs border-collapse">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr><td className="py-2.5 text-slate-500">মোট সম্পন্ন চালান (Orders)</td><td className="py-2.5 text-right font-bold">{formatNumber(reportData.total_orders)} টি</td></tr>
                <tr><td className="py-2.5 text-slate-500">গ্রস বিক্রয় (Gross Sales)</td><td className="py-2.5 text-right font-bold">{formatCurrency(reportData.gross_sales)}</td></tr>
                <tr><td className="py-2.5 text-slate-500">প্রদত্ত মোট ডিসকাউন্ট (Discounts)</td><td className="py-2.5 text-right font-bold text-rose-500">-{formatCurrency(reportData.discount_total)}</td></tr>
                <tr><td className="py-2.5 text-slate-500">সংগৃহীত ভ্যাট / ট্যাক্স (VAT)</td><td className="py-2.5 text-right font-bold">{formatCurrency(reportData.tax_total)}</td></tr>
                <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold"><td className="py-2.5">গ্রস লাভ (Gross Profit)</td><td className="py-2.5 text-right text-emerald-600">{formatCurrency(reportData.gross_profit)}</td></tr>
                <tr><td className="py-2.5 text-slate-500">দোকানের মোট খরচ (Expenses)</td><td className="py-2.5 text-right font-bold text-rose-500">-{formatCurrency(reportData.total_expenses)}</td></tr>
                <tr className="bg-emerald-50/50 dark:bg-emerald-950/30 text-sm font-black"><td className="py-3 text-emerald-900 dark:text-emerald-200">নিট মুনাফা (Net Profit)</td><td className="py-3 text-right text-emerald-600">{formatCurrency(reportData.net_profit)}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Product Performance Table */}
        {activeTab === 'products' && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">পণ্য</th>
                <th className="p-3">বারকোড</th>
                <th className="p-3 text-center">বিক্রয়কৃত সংখ্যা</th>
                <th className="p-3 text-right">অর্জিত রাজস্ব (Revenue)</th>
                <th className="p-3 text-right">মালের ক্রয়মূল্য (COGS)</th>
                <th className="p-3 text-right">লাভ (Estimated Profit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {productData.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{p.product_name}</td>
                  <td className="p-3 font-mono text-slate-500">{p.product_code}</td>
                  <td className="p-3 text-center font-bold">{p.units_sold}</td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(p.revenue)}</td>
                  <td className="p-3 text-right text-slate-500">{formatCurrency(p.total_cogs)}</td>
                  <td className="p-3 text-right font-black text-emerald-600">{formatCurrency(p.estimated_profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Stock Valuation Table */}
        {activeTab === 'stock' && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">পণ্য</th>
                <th className="p-3 text-center">মজুদ পরিমাণ</th>
                <th className="p-3 text-right">একক কেনা দর</th>
                <th className="p-3 text-right">একক বিক্রয় দর</th>
                <th className="p-3 text-right">মোট কেনা মূল্য</th>
                <th className="p-3 text-right">মোট বিক্রয় মূল্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stockData.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="p-3 text-center font-bold">{s.current_stock} {s.unit?.name_bn}</td>
                  <td className="p-3 text-right">{formatCurrency(s.purchase_price)}</td>
                  <td className="p-3 text-right text-indigo-600 font-bold">{formatCurrency(s.selling_price)}</td>
                  <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(s.stock_cost)}</td>
                  <td className="p-3 text-right font-black text-emerald-600">{formatCurrency(s.stock_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

