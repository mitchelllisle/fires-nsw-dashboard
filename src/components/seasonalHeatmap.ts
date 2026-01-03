import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import {colors, generateSequentialScale} from "./colors.js";

interface FireData {
  StartDate?: string;
  AreaHa?: number;
  d_FireType?: string;
}

interface ChartOptions {
  width?: number;
}

export function seasonalHeatmap(
  fires: FireData[],
  {width}: ChartOptions = {}
) {
  // Filter valid fires - only last 15 years for readability, wildfires only
  const currentYear = 2024;
  const startYear = currentYear - 14; // Show 15 years
  
  const validFires = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    if (d.d_FireType !== "Wildfire") return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= startYear && year <= currentYear;
  });

  // Group by year and month
  const heatmapData = d3.rollups(
    validFires,
    v => v.length,
    d => new Date(d.StartDate!).getFullYear(),
    d => new Date(d.StartDate!).getMonth()
  ).flatMap(([year, months]) => 
    Array.from(months, ([month, count]) => ({
      year,
      month,
      count
    }))
  );

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return Plot.plot({
    width,
    height: 300,
    marginTop: 30,
    marginLeft: 50,
    marginRight: 10,
    marginBottom: 30,
    x: {
      label: null,
      tickFormat: d => monthNames[d],
      domain: d3.range(12),
      padding: 0
    },
    y: {
      label: null,
      reverse: true,
      tickFormat: "d",
      padding: 0
    },
    color: {
      type: "threshold",
      range: generateSequentialScale(colors.wildfire),
      domain: [1, 10, 50, 100, 200, 400],
      legend: true,
      label: "Fires per month"
    },
    marks: [
      Plot.cell(heatmapData, {
        x: "month",
        y: "year",
        fill: "count",
        tip: {
          format: {
            x: false,
            y: false,
            fill: false
          }
        },
        inset: 0,
        rx: 0
      }),
      Plot.text(heatmapData, {
        x: "month",
        y: "year",
        text: d => d.count,
        fill: "white",
        fontSize: 10,
        fontWeight: "bold"
      })
    ]
  });
}
