/**
 * Gradient utilities shared across chart components to avoid inline logic.
 */

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function lightenHex(hex: string, delta = 40): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  return `rgb(${clamp(rgb.r + delta)}, ${clamp(rgb.g + delta)}, ${clamp(
    rgb.b + delta
  )})`;
}

export function getRadialGradientStops(baseColor: string) {
  const lighterColor = lightenHex(baseColor);
  return {
    baseColor,
    lighterColor,
  };
}


