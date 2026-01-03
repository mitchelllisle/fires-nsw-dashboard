// Color palette for NSW Bushfires Dashboard
// Inspired by EIA dashboard color scheme

export const colors = {
  // Primary data colors
  wildfire: "#ff8ab7",      // Pink for wildfires
  prescribedBurn: "#a463f2", // Purple for prescribed burns
  
  // Sequential color schemes for choropleth/heatmaps
  heatmap: {
    scheme: "YlOrRd",
    low: "#ffffcc",
    mid: "#fd8d3c", 
    high: "#800026"
  },
  
  // Accent colors
  accent1: "#a463f2",  // Purple
  accent2: "#ffa07a",  // Coral (for annotations)
  accent3: "#6cc5b0",  // Teal
  
  // Lighter variants for backgrounds
  wildfireLighter: "#ffcfe0",  // Lighter pink
  prescribedBurnLighter: "#d4b5f7", // Lighter purple
  accent3Lighter: "#b8e3d9",  // Lighter teal
  
  // Neutral/UI colors
  background: "currentColor",
  stroke: "var(--theme-foreground-faint)",
  muted: "var(--theme-foreground-muted)"
};

// Color scales for Plot
export const colorScales = {
  fireType: {
    domain: ["Wildfire", "Prescribed Burn"],
    range: [colors.wildfire, colors.prescribedBurn]
  }
};

// Generate sequential color scale from white to target color
export function generateSequentialScale(targetColor: string, steps = 6): string[] {
  // For heatmap - goes from white through lighter shades to the target color
  const baseColors = {
    wildfire: ["white", "#ffe0ec", "#ffb3d1", colors.wildfireLighter, "#ffa5c8", colors.wildfire],
    prescribedBurn: ["white", "#f4effc", "#e5d9f8", colors.prescribedBurnLighter, "#c191f5", colors.prescribedBurn],
    accent3: ["white", "#ecf8f4", "#d4f0e9", colors.accent3Lighter, "#8fd4c1", colors.accent3]
  };
  
  if (targetColor === colors.wildfire) return baseColors.wildfire;
  if (targetColor === colors.prescribedBurn) return baseColors.prescribedBurn;
  if (targetColor === colors.accent3) return baseColors.accent3;
  
  return baseColors.wildfire; // default
}
