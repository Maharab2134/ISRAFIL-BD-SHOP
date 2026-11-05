import React, { useState } from 'react';
import {
  Wheat,
  Milk,
  Coffee,
  Cookie,
  Apple,
  Egg,
  Flame,
  Sparkles,
  Droplet,
  CupSoda,
  Snowflake,
  ShieldCheck,
  Soup,
  Candy,
  Package,
  Boxes,
} from 'lucide-react';
import { normalizeImageUrl } from '../../utils/imageHelper';

/**
 * Maps category name keywords to a distinct, beautiful visual theme and Lucide icon.
 */
export const getCategoryTheme = (categoryName = '') => {
  const name = String(categoryName).toLowerCase();

  if (name.includes('milk') || name.includes('dairy')) {
    return {
      Icon: Milk,
      gradient: 'from-sky-50 via-blue-50/60 to-indigo-100/70 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-indigo-900/40',
      iconColor: 'text-sky-600 dark:text-sky-400',
      ringColor: 'ring-sky-200/50 dark:ring-sky-800/50',
    };
  }
  if (name.includes('flour') || name.includes('baking') || name.includes('atta') || name.includes('ময়দা')) {
    return {
      Icon: Wheat,
      gradient: 'from-amber-50 via-orange-50/60 to-yellow-100/70 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      ringColor: 'ring-amber-200/50 dark:ring-amber-800/50',
    };
  }
  if (name.includes('rice') || name.includes('grain') || name.includes('চাল')) {
    return {
      Icon: Wheat,
      gradient: 'from-emerald-50 via-teal-50/60 to-green-100/70 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-green-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      ringColor: 'ring-emerald-200/50 dark:ring-emerald-800/50',
    };
  }
  if (name.includes('pulse') || name.includes('lentil') || name.includes('ডাল')) {
    return {
      Icon: Boxes,
      gradient: 'from-yellow-50 via-amber-50/60 to-orange-100/70 dark:from-yellow-950/40 dark:via-amber-950/30 dark:to-orange-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      ringColor: 'ring-yellow-200/50 dark:ring-yellow-800/50',
    };
  }
  if (name.includes('oil') || name.includes('তেল')) {
    return {
      Icon: Droplet,
      gradient: 'from-yellow-50 via-amber-50/60 to-yellow-100/70 dark:from-yellow-950/40 dark:via-amber-950/30 dark:to-yellow-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      ringColor: 'ring-amber-200/50 dark:ring-amber-800/50',
    };
  }
  if (name.includes('spice') || name.includes('মসলা') || name.includes('chili') || name.includes('morich')) {
    return {
      Icon: Flame,
      gradient: 'from-rose-50 via-red-50/60 to-orange-100/70 dark:from-rose-950/40 dark:via-red-950/30 dark:to-orange-900/40',
      iconColor: 'text-rose-600 dark:text-rose-400',
      ringColor: 'ring-rose-200/50 dark:ring-rose-800/50',
    };
  }
  if (name.includes('tea') || name.includes('coffee') || name.includes('চা')) {
    return {
      Icon: Coffee,
      gradient: 'from-stone-50 via-amber-50/60 to-stone-100/70 dark:from-stone-900/40 dark:via-amber-950/30 dark:to-stone-800/40',
      iconColor: 'text-amber-800 dark:text-amber-300',
      ringColor: 'ring-stone-200/50 dark:ring-stone-800/50',
    };
  }
  if (name.includes('biscuit') || name.includes('cookie') || name.includes('বিস্কুট')) {
    return {
      Icon: Cookie,
      gradient: 'from-orange-50 via-amber-50/60 to-yellow-100/70 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-yellow-900/40',
      iconColor: 'text-orange-600 dark:text-orange-400',
      ringColor: 'ring-orange-200/50 dark:ring-orange-800/50',
    };
  }
  if (name.includes('snack') || name.includes('chip') || name.includes('চিপস')) {
    return {
      Icon: Package,
      gradient: 'from-orange-50 via-rose-50/60 to-amber-100/70 dark:from-orange-950/40 dark:via-rose-950/30 dark:to-amber-900/40',
      iconColor: 'text-orange-600 dark:text-orange-400',
      ringColor: 'ring-orange-200/50 dark:ring-orange-800/50',
    };
  }
  if (name.includes('noodle') || name.includes('pasta') || name.includes('নুডুলস')) {
    return {
      Icon: Soup,
      gradient: 'from-yellow-50 via-orange-50/60 to-amber-100/70 dark:from-yellow-950/40 dark:via-orange-950/30 dark:to-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      ringColor: 'ring-yellow-200/50 dark:ring-yellow-800/50',
    };
  }
  if (name.includes('sauce') || name.includes('condiment') || name.includes('সস')) {
    return {
      Icon: Flame,
      gradient: 'from-red-50 via-rose-50/60 to-orange-100/70 dark:from-red-950/40 dark:via-rose-950/30 dark:to-orange-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      ringColor: 'ring-red-200/50 dark:ring-red-800/50',
    };
  }
  if (name.includes('beverage') || name.includes('drink') || name.includes('juice') || name.includes('জুস')) {
    return {
      Icon: CupSoda,
      gradient: 'from-cyan-50 via-sky-50/60 to-blue-100/70 dark:from-cyan-950/40 dark:via-sky-950/30 dark:to-blue-900/40',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      ringColor: 'ring-cyan-200/50 dark:ring-cyan-800/50',
    };
  }
  if (name.includes('chocolate') || name.includes('candy') || name.includes('চকলেট')) {
    return {
      Icon: Candy,
      gradient: 'from-purple-50 via-fuchsia-50/60 to-pink-100/70 dark:from-purple-950/40 dark:via-fuchsia-950/30 dark:to-pink-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      ringColor: 'ring-purple-200/50 dark:ring-purple-800/50',
    };
  }
  if (name.includes('frozen') || name.includes('ice') || name.includes('ফ্রোজেন')) {
    return {
      Icon: Snowflake,
      gradient: 'from-blue-50 via-cyan-50/60 to-indigo-100/70 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-indigo-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      ringColor: 'ring-blue-200/50 dark:ring-blue-800/50',
    };
  }
  if (name.includes('egg') || name.includes('protein') || name.includes('ডিম')) {
    return {
      Icon: Egg,
      gradient: 'from-amber-50 via-yellow-50/60 to-orange-100/70 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      ringColor: 'ring-amber-200/50 dark:ring-amber-800/50',
    };
  }
  if (name.includes('produce') || name.includes('fruit') || name.includes('vegetable') || name.includes('সবজি')) {
    return {
      Icon: Apple,
      gradient: 'from-green-50 via-emerald-50/60 to-lime-100/70 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-lime-900/40',
      iconColor: 'text-green-600 dark:text-green-400',
      ringColor: 'ring-green-200/50 dark:ring-green-800/50',
    };
  }
  if (name.includes('personal') || name.includes('soap') || name.includes('shampoo')) {
    return {
      Icon: Sparkles,
      gradient: 'from-pink-50 via-rose-50/60 to-purple-100/70 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-purple-900/40',
      iconColor: 'text-pink-600 dark:text-pink-400',
      ringColor: 'ring-pink-200/50 dark:ring-pink-800/50',
    };
  }
  if (name.includes('home') || name.includes('clean') || name.includes('detergent')) {
    return {
      Icon: ShieldCheck,
      gradient: 'from-teal-50 via-emerald-50/60 to-cyan-100/70 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-cyan-900/40',
      iconColor: 'text-teal-600 dark:text-teal-400',
      ringColor: 'ring-teal-200/50 dark:ring-teal-800/50',
    };
  }
  if (name.includes('salt') || name.includes('sugar') || name.includes('লবণ') || name.includes('চিনি')) {
    return {
      Icon: Sparkles,
      gradient: 'from-slate-50 via-sky-50/60 to-indigo-50/70 dark:from-slate-900/40 dark:via-sky-950/30 dark:to-indigo-950/40',
      iconColor: 'text-sky-600 dark:text-sky-400',
      ringColor: 'ring-sky-200/50 dark:ring-sky-800/50',
    };
  }

  // Default theme
  return {
    Icon: Package,
    gradient: 'from-slate-50 via-indigo-50/40 to-slate-100 dark:from-slate-900/40 dark:via-indigo-950/20 dark:to-slate-800/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    ringColor: 'ring-indigo-200/50 dark:ring-indigo-800/50',
  };
};

/**
 * ProductCardMedia:
 * High-performance, responsive product image presentation with fallback to category graphics.
 * - object-contain ensures packaging is never cropped, clipped, or distorted.
 * - Pure, crisp background with soft padding gives retail-shelf depth.
 * - Missing images display a category-tailored visual with brand badge.
 */
export const ProductCardMedia = ({
  product,
  className = '',
  imageClassName = '',
  aspectRatio = 'aspect-4/3',
  isCompact = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const categoryName = product?.category?.name || '';
  const brandName = product?.brand?.name && product.brand.name !== 'Unbranded' ? product.brand.name : '';
  const theme = getCategoryTheme(categoryName);
  const IconComponent = theme.Icon;

  const rawImageUrl = product?.image_url;
  const normalizedUrl = rawImageUrl ? normalizeImageUrl(rawImageUrl) : '';
  const shouldRenderImage = Boolean(normalizedUrl) && !imageError;

  // Monogram initials for products without brand
  const initials = (product?.name || 'PR')
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();

  if (isCompact) {
    // Compact mode (for list rows or thumbnails)
    return (
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}
      >
        {shouldRenderImage ? (
          <img
            src={normalizedUrl}
            alt={product?.name || ''}
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain p-1 transition-transform duration-200 group-hover:scale-105 ${imageClassName}`}
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center font-black text-xs ${theme.iconColor}`}
          >
            <IconComponent className="w-5 h-5 opacity-90" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/70 dark:border-slate-800/90 transition-all duration-200 shadow-inner group/media ${
        shouldRenderImage ? 'bg-white dark:bg-slate-900/90' : `bg-gradient-to-br ${theme.gradient}`
      } ${className}`}
    >
      {shouldRenderImage ? (
        <img
          src={normalizedUrl}
          alt={product?.name || ''}
          onError={() => setImageError(true)}
          className={`w-full h-full object-contain p-2.5 sm:p-3 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm select-none ${imageClassName}`}
          loading="lazy"
        />
      ) : (
        /* Rich Category Presentation Graphic */
        <div className="w-full h-full p-3 flex flex-col items-center justify-center relative select-none">
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Central Glassmorphic Category Icon */}
          <div
            className={`relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-md ring-4 ${theme.ringColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 mb-1.5`}
          >
            <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 ${theme.iconColor} stroke-[1.8]`} />
          </div>

          {/* Brand Badge / Product Monogram */}
          {brandName ? (
            <span className="relative z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-800/95 shadow-xs border border-slate-200/60 dark:border-slate-700/60 max-w-[90%] truncate">
              {brandName}
            </span>
          ) : (
            <span className="relative z-10 font-mono text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full shadow-xs">
              {initials}
            </span>
          )}

          {/* Subtle Category Hint at Bottom */}
          <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 mt-1 truncate max-w-[90%]">
            {categoryName || 'Item'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductCardMedia;

