import React, { useMemo } from 'react';

// Standard Code 128 B Patterns (each is 6 digits of bar/space widths summing to 11 modules)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

/**
 * Pure SVG Barcode Renderer using standard Code 128 B.
 * Guarantees crisp vector printing on thermal and laser printers.
 */
export const BarcodeSvg = ({ code, value, height = 36, className = "w-full h-7 mx-auto" }) => {
  const cleanCode = String(code || value || '0000000000').trim();

  const rects = useMemo(() => {
    let checksum = 104; // Start B symbol
    const sequence = [104];

    for (let i = 0; i < cleanCode.length; i++) {
      const charCode = cleanCode.charCodeAt(i) - 32;
      if (charCode >= 0 && charCode <= 95) {
        sequence.push(charCode);
        checksum += charCode * (i + 1);
      }
    }

    sequence.push(checksum % 103);
    sequence.push(106); // Stop symbol

    const bars = [];
    let currentX = 6;
    const unitWidth = 1.4;

    sequence.forEach((s) => {
      const pattern = CODE128_PATTERNS[s];
      if (pattern) {
        for (let p = 0; p < pattern.length; p++) {
          const width = parseInt(pattern[p], 10) * unitWidth;
          if (p % 2 === 0) {
            bars.push({ x: currentX, width });
          }
          currentX += width;
        }
      }
    });

    return { bars, totalWidth: currentX + 6 };
  }, [cleanCode]);

  return (
    <svg
      viewBox={`0 0 ${rects.totalWidth} ${height}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {rects.bars.map((r, idx) => (
        <rect
          key={idx}
          x={r.x}
          y="0"
          width={r.width}
          height={height}
          fill="#000000"
        />
      ))}
    </svg>
  );
};

export default BarcodeSvg;
