import React, { useState } from 'react';
import { Wrench, ShieldCheck, Power, CheckCircle2 } from 'lucide-react';
import { useSystemModules } from '../../context/SystemModuleContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const SuperAdminMaintenanceBanner = ({ module }) => {
  const { toggleModuleMaintenance } = useSystemModules();
  const { lang } = useLanguage();
  const { success, error } = useToast();
  const [toggling, setToggling] = useState(false);

  if (!module || !module.is_maintenance) return null;

  const handleDeactivateMaintenance = async () => {
    setToggling(true);
    const res = await toggleModuleMaintenance(module.id, false);
    setToggling(false);
    if (res.success) {
      success(
        lang === 'bn'
          ? `'${module.name_bn || module.name}' সেকশন সফলভাবে পুনরায় চালু করা হয়েছে!`
          : `'${module.name}' maintenance turned off!`
      );
    } else {
      error(res.message);
    }
  };

  const sectionName = lang === 'bn' ? (module.name_bn || module.name) : module.name;

  return (
    <div className="mb-4 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Wrench className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold underline decoration-amber-400">
            {lang === 'bn' ? 'সুপার অ্যাডমিন / ডেভেলপার প্রিভিউ:' : 'Super Admin Developer Mode:'}
          </span>{' '}
          <span>
            {lang === 'bn'
              ? `'${sectionName}' সেকশনটি বর্তমানে রক্ষণাবেক্ষণে রয়েছে। সাধারণ গ্রাহক বা কর্মীরা মেইনটেন্যান্স স্ক্রিন দেখতে পাবেন, কিন্তু আপনি অবাধে টেস্ট ও কাজ করতে পারছেন।`
              : `'${sectionName}' is currently in maintenance mode. Non-admin users see the maintenance screen.`}
          </span>
        </div>
      </div>

      <button
        onClick={handleDeactivateMaintenance}
        disabled={toggling}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer disabled:opacity-50"
      >
        <Power className="w-3.5 h-3.5" />
        <span>
          {toggling
            ? lang === 'bn' ? 'সক্রিয় হচ্ছে...' : 'Enabling...'
            : lang === 'bn' ? 'মেইনটেন্যান্স বন্ধ করুন' : 'Turn Off Maintenance'}
        </span>
      </button>
    </div>
  );
};

export default SuperAdminMaintenanceBanner;

