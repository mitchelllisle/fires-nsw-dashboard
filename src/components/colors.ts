// Color palette for NSW Bushfires Dashboard
// Warm, earthy palette inspired by fire and nature

export const colors = {
  // Primary data colors
  wildfire: "#B4436C",      // Magenta/burgundy for wildfires
  prescribedBurn: "#F78154", // Orange/coral for prescribed burns
  
  // Sequential color schemes for choropleth/heatmaps
  heatmap: {
    scheme: "YlOrRd",
    low: "#F2C14E",
    mid: "#F78154", 
    high: "#B4436C"
  },
  
  // Accent colors
  accent1: "#F78154",  // Orange
  accent2: "#B4436C",  // Magenta
  accent3: "#F2C14E",  // Gold/yellow
  
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
