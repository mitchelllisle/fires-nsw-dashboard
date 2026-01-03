import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {colors} from "./colors.js";

interface FireData {
  StartDate?: string;
  AreaHa?: number;
  d_FireType?: string;
  Label?: string;
  FireName?: string | null;
  longitude?: number;
  latitude?: number;
}

interface MapOptions {
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
}

export function fireMap(
  fires: FireData[],
  nswSuburbs: any,
  {width, height}: MapOptions = {}
) {
  // Filter fires that have valid coordinates and dates
  const validFires = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    if (!d.longitude || !d.latitude) return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024;
  });

  // Use available height from resize helper
//   const plotHeight = height || 660;

  return Plot.plot({
    width,
    // height: plotHeight,
    style: {
      background: "transparent"
    },
    margin: 0,
    projection: {
      type: "mercator",
      domain: nswSuburbs,
      inset: 30
    },
    color: {
      type: "categorical",
      domain: ["Wildfire", "Prescribed Burn"],
      range: [colors.wildfire, colors.prescribedBurn],
      legend: true
    },
    marks: [
      // Suburb boundaries
      Plot.geo(nswSuburbs, {
        stroke: "var(--theme-background)",
        strokeWidth: 0.5,
        fill: "var(--theme-foreground-faintest)",
        fillOpacity: 1
      }),
      // Fire points
      Plot.dot(validFires, {
        x: "longitude",
        y: "latitude",
        fill: d => d.d_FireType === "Prescribed Burn" ? "Prescribed Burn" : "Wildfire",
        r: 7,
        fillOpacity: 0.6,
        tip: true,
        channels: {
          "Fire Name": "FireName",
          "Area (ha)": d => d.AreaHa?.toLocaleString() || "Unknown",
          "Date": d => d.StartDate ? new Date(d.StartDate).toLocaleDateString() : "Unknown",
          "Type": d => d.d_FireType || "Unknown"
        }
      })
    ]
  });
}
