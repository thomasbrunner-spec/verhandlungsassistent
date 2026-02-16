// CI-Farbschema basierend auf era corporate design
export const C = {
  // Hintergründe
  bgDeep: "#0c1929",       // Tiefster Hintergrund
  bgMain: "#0f2035",       // Haupt-Hintergrund
  bgSidebar: "#0b1825",    // Sidebar
  bgCard: "#142d4a",       // Karten/Panels
  bgCardHover: "#1a3a5c",  // Karten Hover
  bgInput: "#0f2035",      // Input-Felder

  // Borders
  border: "#1e3d5f",       // Standard-Border
  borderLight: "#2a5078",  // Hellerer Border

  // Akzent (Orange/Amber)
  accent: "#e8a838",       // Primär-Akzent (Orange)
  accentHover: "#f0b848",  // Akzent Hover
  accentBg: "#e8a83815",   // Akzent transparent für Hintergründe
  accentBorder: "#e8a83840", // Akzent transparent für Borders

  // Text
  textPrimary: "#ffffff",   // Primärtext
  textSecondary: "#b8c8dc", // Sekundärtext
  textMuted: "#6889a8",     // Gedämpfter Text
  textDim: "#3d6080",       // Sehr gedämpft (Labels etc.)

  // Status
  success: "#2E7D32",
  error: "#C62828",
} as const;
