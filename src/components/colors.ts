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
  accent2: "#ff8ab7",  // Pink
  accent3: "#6cc5b0",  // Teal
  
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
