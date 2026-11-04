import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Upload,
  FileJson,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';

export const InlineJsonImport = ({
  title,
  endpoint,
  sampleFilename = 'data.json',
  sampleData = [],
  onSuccess,
  onClose,
}) => {
  const { lang } = useLanguage();
  const { success, error } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.json')) {
        error(lang === 'bn' ? 'শুধুমাত্র .json ফাইল গ্রহণযোগ্য।' : 'Only .json files are allowed.');
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDownloadSample = () => {
    const jsonStr = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sampleFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult({
        success: true,
        data: res.data,
      });

      success(res.data.message || (lang === 'bn' ? 'ডাটা সফলভাবে ইমপোর্ট সম্পন্ন হয়েছে!' : 'Data imported successfully!'));

      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'JSON ফাইল ইমপোর্ট ব্যর্থ হয়েছে।' : 'JSON import failed.');
      setResult({
        success: false,
        message: msg,
      });
      error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title || (lang === 'bn' ? 'JSON বাল্ক ডাটা ইমপোর্ট' : 'JSON Bulk Data Import')}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'bn'
                ? 'ডাটাবেজে ইনসার্ট হওয়ার সাথে সাথে ফাইলটি স্বয়ংক্রিয়ভাবে মুছে যাবে (জিরো স্টোরেজ)'
                : 'Zero persistence: file is processed in memory and auto-deleted immediately'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'bn' ? 'নমুনা JSON ডাউনলোড' : 'Download Sample'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* File Drop & Selection Area */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
          id={`json-file-input-${sampleFilename}`}
        />

        <label
          htmlFor={`json-file-input-${sampleFilename}`}
          className="w-full sm:flex-1 py-4 px-4 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center gap-3 cursor-pointer transition text-center"
        >
          <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div className="text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {selectedFile ? selectedFile.name : (lang === 'bn' ? `${sampleFilename} ফাইল নির্বাচন করুন` : `Select ${sampleFilename}`)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                : (lang === 'bn' ? 'ক্লিক করে ফাইল বাছুন অথবা এখানে এনে ড্রপ করুন' : 'Click to browse or drop JSON file here')}
            </span>
          </div>
        </label>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'bn' ? 'ইমপোর্ট হচ্ছে...' : 'Importing...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ডাটাবেজে আপলোড করুন' : 'Upload to Database'}</span>
              </>
            )}
          </button>

          {selectedFile && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition text-xs"
              title={lang === 'bn' ? 'বাতিল' : 'Cancel'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Result feedback */}
      {result && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between ${
            result.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{result.data?.message || result.message}</span>
          </div>

          {result.success && result.data && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              +{result.data.inserted} {lang === 'bn' ? 'নতুন' : 'new'} / {result.data.updated} {lang === 'bn' ? 'আপডেট' : 'updated'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineJsonImport;

