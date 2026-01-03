import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import {colors} from "./colors.js";

interface FireData {
  StartDate?: string;
  AreaHa?: number;
  Label?: string;
  FireName?: string;
  d_FireType?: string;
}

interface ChartOptions {
  width?: number;
}

export function bigFiresScatter(
  fires: FireData[],
  {width}: ChartOptions = {}
) {
  // Filter for big fires (>50,000 hectares)
  const bigFires = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    if (!d.AreaHa || d.AreaHa <= 50000) return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024;
  });

  // Map to chart data
  const chartData = bigFires.map(fire => {
    const date = new Date(fire.StartDate!);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 1-12
      areaHa: fire.AreaHa!,
      name: fire.Label || fire.FireName || "Unknown"
    };
  });

  // Find the largest fire in each period
  const fires1970s = chartData.filter(d => d.year >= 1970 && d.year < 1980);
  const fires2000s = chartData.filter(d => d.year >= 2000 && d.year < 2010);
  const fires2019 = chartData.filter(d => d.year >= 2019 && d.year <= 2020);

  const largest1970s = fires1970s.length > 0 ? fires1970s.reduce((max, fire) => fire.areaHa > max.areaHa ? fire : max) : null;
  const largest2000s = fires2000s.length > 0 ? fires2000s.reduce((max, fire) => fire.areaHa > max.areaHa ? fire : max) : null;
  const largest2019 = fires2019.length > 0 ? fires2019.reduce((max, fire) => fire.areaHa > max.areaHa ? fire : max) : null;

  // Rename fires with better display names
  if (largest1970s) largest1970s.displayName = "1974-75 Wildfire";
  if (largest2000s) largest2000s.displayName = "Kosciuszko (2003)";
  if (largest2019) largest2019.displayName = "Gospers Mountain (2019)";

  const periodicLargest = [largest1970s, largest2000s, largest2019].filter(f => f !== null);

  // Context for each fire
  const fireContext: Record<string, string> = {
    "1974-75 Wildfire": "Largest fire contained by humans in NSW",
    "Kosciuszko (2003)": "During Australia's worst drought in 103 years",
    "Gospers Mountain (2019)": "Largest fire from single ignition point in Australian history"
  };

  return Plot.plot({
    width,
    height: 450,
    marginTop: 30,
    marginLeft: 60,
    marginRight: 40,
    marginBottom: 60,
    x: {
      label: "Month",
      domain: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      tickFormat: (d: any) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d - 1]
    },
    y: {
      label: "Year",
      grid: true,
      reverse: false,
      tickFormat: "d"
    },
    r: {
      range: [3, 25]
    },
    marks: [
      Plot.dot(chartData, {
        x: "month",
        y: "year",
        r: "areaHa",
        fill: colors.wildfire,
        fillOpacity: 0.6,
        stroke: colors.wildfire,
        strokeOpacity: 0.8,
        tip: {
          format: {
            x: false,
            y: false,
            r: false
          }
        },
        title: (d: any) => `${d.name}\n${d.year}\nArea: ${d.areaHa.toLocaleString()} ha`
      }),
      // Annotations for largest fires in each period
      Plot.text(periodicLargest, {
        x: "month",
        y: (d: any) => d.year - 6,
        text: (d: any) => d.displayName || d.name,
        dy: -90,
        fontSize: 11,
        fontWeight: "bold",
        fill: colors.accent2,
        lineWidth: 18
      }),
      Plot.text(periodicLargest, {
        x: "month",
        y: (d: any) => d.year - 6,
        text: (d: any) => fireContext[d.displayName || d.name] || "",
        dy: -74,
        fontSize: 8.5,
        fill: colors.muted,
        fontStyle: "italic",
        lineWidth: 20
      })
    ]
  });
}
