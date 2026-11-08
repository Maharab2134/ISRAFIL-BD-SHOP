import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Users,
  Building2,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const OrgChart = () => {
  const { lang } = useLanguage();
  const { error } = useToast();

  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState([]);
  const [totalActive, setTotalActive] = useState(0);
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [search, setSearch] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const fetchOrgChart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees/org-chart');
      setTreeData(res.data?.tree || []);
      setTotalActive(res.data?.total_active || 0);
    } catch (err) {
      error(lang === 'bn' ? 'অর্গানোগ্রাম লোড করতে সমস্যা হয়েছে।' : 'Failed to load organization chart.');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.5, z + 0.1));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, z - 0.1));
  const handleResetZoom = () => setZoomLevel(1);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node, depth = 0) => {
    const isCollapsed = !!collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isHighlighted =
      search.trim() &&
      (node.name?.toLowerCase().includes(search.toLowerCase()) ||
        node.designation?.toLowerCase().includes(search.toLowerCase()) ||
        node.department?.toLowerCase().includes(search.toLowerCase()));

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          className={`relative p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all duration-200 shadow-md hover:shadow-xl w-64 sm:w-72 ${
            isHighlighted
              ? 'ring-4 ring-amber-400 border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
              : depth === 0
              ? 'border-indigo-500/80 ring-2 ring-indigo-500/20'
              : 'border-slate-200/80 dark:border-slate-700/80'
          }`}
        >
          {depth === 0 && (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
              {lang === 'bn' ? 'শীর্ষ নেতৃত্ব' : 'Top Leadership'}
            </span>
          )}

          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black text-sm flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {node.avatar ? (
                <img src={node.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (node.name || 'U')[0]?.toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/employees/${node.id}`}
                className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block group flex items-center gap-1"
                title={node.name}
              >
                <span className="truncate">{node.name}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition shrink-0" />
              </Link>

              <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 truncate mt-0.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3 shrink-0" />
                <span className="truncate">{node.designation || 'Staff'}</span>
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{node.department || 'Operations'}</span>
              </div>

              {node.branch && (
                <div className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{node.branch}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subordinates count and toggle */}
          {hasChildren && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>
                  {node.children.length} {lang === 'bn' ? 'অধীনস্থ কর্মী' : 'Subordinates'}
                </span>
              </span>

              <button
                type="button"
                onClick={() => toggleNode(node.id)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {isCollapsed ? (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'দেখান' : 'Expand'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'লুকান' : 'Collapse'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Children Sub-Tree */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center">
            {/* Vertical connector line */}
            <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />

            {/* Horizontal connector line for multiple children */}
            {node.children.length > 1 && (
              <div className="relative w-full flex justify-center">
                <div className="h-0.5 bg-slate-300 dark:bg-slate-600 w-full max-w-[calc(100%-8rem)]" />
              </div>
            )}

            {/* Children container */}
            <div className="flex flex-wrap items-start justify-center gap-6 pt-2">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-600" />
                  {renderTreeNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {lang === 'bn' ? 'সাংগঠনিক কাঠামো (Organization Chart)' : 'Organization Hierarchy Chart'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'সুপার শপ কর্মী কাঠামোর রিপোর্টিং ম্যানেজমেন্ট এবং সাংগঠনিক ট্রি ভিউ'
                  : 'Interactive reporting hierarchy and supervisory structure across branches'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-xs">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-slate-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchOrgChart}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title={lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and KPI Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'কর্মী, পদবী বা বিভাগ খুঁজুন...' : 'Search employee, designation, dept...'}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {lang === 'bn' ? 'মোট সক্রিয় কর্মী:' : 'Total Active Headcount:'} {totalActive}
            </span>
          </div>
        </div>
      </div>

      {/* Tree Visualization Canvas */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-12 min-h-[600px] overflow-auto shadow-inner flex justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-semibold">
              {lang === 'bn' ? 'সাংগঠনিক কাঠামো লোড হচ্ছে...' : 'Building organization hierarchy...'}
            </p>
          </div>
        ) : treeData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Network className="w-12 h-12 opacity-30 mb-3" />
            <p className="text-sm font-semibold">
              {lang === 'bn' ? 'কোনো কর্মী রেকর্ড পাওয়া যায়নি' : 'No organizational hierarchy nodes available'}
            </p>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="flex flex-wrap items-start justify-center gap-12"
          >
            {treeData.map((rootNode) => renderTreeNode(rootNode, 0))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChart;

