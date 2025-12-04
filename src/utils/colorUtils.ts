
const fireantColors = {
  // ▼▼▼ GIẢM MẠNH (≤ -5%) — đỏ thẫm ▼▼▼
  strongBearish: "#A10000",

  // ▼▼▼ GIẢM VỪA (-5 → -2%) — đỏ cam ▼▼▼
  moderateBearish: "#F00000",

  // ▼▼▼ GIẢM NHẸ (-2 → 0%) — vàng nhạt ▼▼▼
  mildBearish: "#FF661A",

  // ▲▲▲ TĂNG NHẸ (0 → +2%) — xanh chuối sáng ▲▲▲
  mildBullish: "#76E600",

  // ▲▲▲ TĂNG VỪA (+2 → +5%) — xanh neon ▲▲▲
  moderateBullish: "#166F00",

  // ▲▲▲ TĂNG MẠNH (≥ +5%) — xanh đậm ▲▲▲
  strongBullish: "#166F00"
};


// ===================================================
// Hàm chính – GIỮ NGUYÊN LOGIC THRESHOLD của bạn
// nhưng màu theo đúng phong cách FireAnt
// ===================================================
export function getColorFromChangePercent(changePercent: number): string {
  if (!Number.isFinite(changePercent)) {
    return "#2A2D3A"; // Neutral background
  }

  // 🔥 Strong bullish ≥ +5%
  if (changePercent >= 5) {
    return fireantColors.strongBullish;
  }

  // 💹 Moderate bullish +2 → +5%
  if (changePercent >= 2) {
    return fireantColors.moderateBullish;
  }

  // 🙂 Mild bullish +0 → +2%
  if (changePercent >= 0) {
    return fireantColors.mildBullish;
  }

  // 🟧 Mild bearish -2 → 0
  if (changePercent >= -2) {
    return fireantColors.mildBearish;
  }

  // 🔥 Moderate bearish -5 → -2
  if (changePercent >= -5) {
    return fireantColors.moderateBearish;
  }

  // 💀 Strong bearish ≤ -5%
  return fireantColors.strongBearish;
}
