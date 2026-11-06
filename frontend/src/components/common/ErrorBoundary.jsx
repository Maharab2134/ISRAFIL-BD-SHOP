import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    const sectionName = this.props.section || window.location.pathname;

    // Immediately report error to backend so Super Admin is informed
    try {
      api.post('/system/report-error', {
        section: sectionName,
        error_message: error?.message || String(error),
        error_stack: error?.stack || '',
        component_stack: errorInfo?.componentStack || '',
        url: window.location.href,
      }).catch(() => {});

      // Dispatch global window event for instant UI alerts
      window.dispatchEvent(
        new CustomEvent('israfil:system-error', {
          detail: {
            section: sectionName,
            errorMessage: error?.message || 'Component Crash',
            timestamp: new Date(),
          },
        })
      );
    } catch (e) {
      // Safe fallback
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleCopyDebug = () => {
    const text = `Section: ${this.props.section || window.location.pathname}\nError: ${this.state.error?.message}\nStack: ${this.state.error?.stack}\nComponent: ${this.state.errorInfo?.componentStack}`;
    navigator.clipboard?.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    if (this.state.hasError) {
      // Check if user is super admin from localStorage
      let isSuperAdmin = false;
      try {
        const savedUser = JSON.parse(localStorage.getItem('israfil_user') || '{}');
        isSuperAdmin = savedUser?.role?.slug === 'super-admin' || savedUser?.email === 'admin@israfilbd.com';
      } catch (e) {}

      return (
        <div className="min-h-[420px] flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 shadow-sm">
                <AlertTriangle className="w-7 h-7 animate-pulse" />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 mb-2.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>ক্র্যাশ প্রতিরোধ সুরক্ষা (Crash Shield Active)</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  এই সেকশনে সাময়িক সমস্যা হয়েছে
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  চিন্তার কিছু নেই! সিস্টেম ক্র্যাশ প্রতিরোধ করা হয়েছে এবং সুপার অ্যাডমিনকে স্বয়ংক্রিয়ভাবে এই ত্রুটির বিষয়ে অবহিত করা হয়েছে। আপনি পৃষ্ঠাটি পুনরায় লোড করতে পারেন অথবা ড্যাশবোর্ডে ফিরে যেতে পারেন।
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>আবার চেষ্টা করুন</span>
                  </button>

                  <a
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all active:scale-95"
                  >
                    <Home className="w-4 h-4" />
                    <span>ড্যাশবোর্ডে ফিরে যান</span>
                  </a>

                  {isSuperAdmin && (
                    <button
                      onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium cursor-pointer"
                    >
                      <span>কারিগরি তথ্য</span>
                      {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Super Admin Debug View */}
                {isSuperAdmin && this.state.showDetails && (
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                        {this.state.error?.name}: {this.state.error?.message}
                      </span>
                      <button
                        onClick={this.handleCopyDebug}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                      >
                        {this.state.copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{this.state.copied ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </div>

                    <pre className="text-[11px] font-mono p-3 rounded-xl bg-slate-900 text-slate-200 overflow-x-auto max-h-48 border border-slate-800 leading-snug">
                      {this.state.error?.stack}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

