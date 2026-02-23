// ============================================
// DRAWING TOOLS CONSTANTS
// ============================================

export const DRAWING_COLORS = [
  { hex: "#000000", name: "Black" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#EF4444", name: "Red" },
  { hex: "#F59E0B", name: "Orange" },
  { hex: "#FBBF24", name: "Yellow" },
  { hex: "#10B981", name: "Green" },
  { hex: "#06B6D4", name: "Cyan" },
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#8B5CF6", name: "Purple" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#92400E", name: "Brown" },
  { hex: "#6B7280", name: "Gray" },
] as const;

export const STROKE_WIDTHS = [2, 5, 10, 15, 20] as const;

export const DEFAULT_DRAWING_SETTINGS = {
  color: "#000000",
  strokeWidth: 5,
  tool: "pen" as const,
} as const;

export const TOOL_TYPES = {
  PEN: "pen" as const,
  ERASER: "eraser" as const,
} as const;

// ============================================
// GAME SETTINGS CONSTANTS
// ============================================

export const ROUND_OPTIONS = [1, 2, 4, 8] as const;
export const TIME_OPTIONS = [30, 60, 90, 120] as const;

export const DEFAULT_GAME_SETTINGS = {
  totalRounds: 1,
  roundTime: 60,
} as const;

// ============================================
// UI THEME COLORS (for consistency across components)
// ============================================

export const THEME_COLORS = {
  background: {
    deep: "#0f172a",
    mid: "#1e293b",
    card: "#1e293b",
  },
  primary: {
    purple: "#8b5cf6",
    pink: "#ec4899",
    cyan: "#06b6d4",
    teal: "#14b8a6",
  },
  accent: {
    green: "#10b981",
    yellow: "#f59e0b",
    orange: "#f97316",
    red: "#ef4444",
  },
  text: {
    primary: "#f1f5f9",
    secondary: "#cbd5e1",
    dim: "#64748b",
  },
  border: {
    default: "#334155",
    hover: "#475569",
  },
} as const;

// ============================================
// CANVAS SETTINGS
// ============================================

export const CANVAS_CONFIG = {
  placeholderText: "Start drawing...",
  placeholderFont: "Space Mono",
  placeholderSize: 14,
  placeholderColor: "#999999",
} as const;

export const WORD_CATEGORY_NAMES = [
  "Random",
  "Animals",
  "Food",
  "Sports",
  "Movies",
  "Nature",
  "Technology",
] as const;

export type WordCategory = typeof WORD_CATEGORY_NAMES[number];

export const CATEGORY_EMOJIS: Record<WordCategory, string> = {
  Random: "🎲",
  Animals: "🐾",
  Food: "🍕",
  Sports: "⚽",
  Movies: "🎬",
  Nature: "🌿",
  Technology: "💻",
};
