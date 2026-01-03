import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import {colors} from "./colors.js";

interface FireData {
  StartDate?: string;
  AreaHa?: number;
  FireName?: string | null;
  d_FireType?: string;
}

interface ChartOptions {
  width?: number;
}

export function topLargestFires(
  fires: FireData[],
  {width}: ChartOptions = {}
) {
  // Filter valid fires with area data
  const validFires = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    if (!d.AreaHa || d.AreaHa === 0) return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024;
  });

  // Get top 10 largest fires
  const topFires = validFires
    .sort((a, b) => (b.AreaHa || 0) - (a.AreaHa || 0))
    .slice(0, 10)
    .map(d => ({
      name: d.FireName || "Unnamed",
      year: new Date(d.StartDate!).getFullYear(),
      area: d.AreaHa || 0,
      label: `${d.FireName || "Unnamed"} (${new Date(d.StartDate!).getFullYear()})`
    }));

  return Plot.plot({
    width,
    height: 320,
    marginTop: 30,
    marginLeft: 200,
    marginRight: 80,
    x: {
      label: "Area (hectares)",
      grid: true,
      tickFormat: "~s"
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(topFires, {
        x: "area",
        y: "label",
        fill: colors.accent2,
        sort: {y: "-x"},
        tip: true,
        channels: {
          "Fire name": "name",
          "Year": "year",
          "Area (ha)": d => d3.format(",.0f")(d.area)
        }
      }),
      Plot.ruleX([0])
    ]
  });
}
