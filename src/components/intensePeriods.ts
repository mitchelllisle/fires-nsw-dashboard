import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import {colors} from "./colors.js";

interface FireData {
  StartDate?: string;
  AreaHa?: number;
  Label?: string;
  d_FireType?: string;
}

interface ChartOptions {
  width?: number;
}

export function intensePeriods(
  fires: FireData[],
  {width}: ChartOptions = {}
) {
  // Filter valid fires
  const validFires = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    if (!d.AreaHa || d.AreaHa <= 0) return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024;
  });

  // Group into 5-year buckets
  const firesWithPeriod = validFires.map(fire => {
    const year = new Date(fire.StartDate!).getFullYear();
    const periodStart = Math.floor(year / 5) * 5;
    const periodEnd = periodStart + 4;
    return {
      ...fire,
      period: `${periodStart}-${periodEnd}`,
      periodStart,
      year
    };
  });

  // Sum area by period
  const periodData = Array.from(
    d3.rollup(
      firesWithPeriod,
      (v: any[]) => ({
        totalArea: d3.sum(v, (d: any) => d.AreaHa || 0),
        minYear: d3.min(v, (d: any) => d.year),
        maxYear: d3.max(v, (d: any) => d.year)
      }),
      (d: any) => d.period
    ),
    ([period, data]: [string, any]) => ({
      period,
      totalArea: data.totalArea,
      minYear: data.minYear,
      maxYear: data.maxYear
    })
  )
  .sort((a, b) => a.period.localeCompare(b.period));

  // Get top 3 for annotations
  const top3 = periodData.slice().sort((a, b) => b.totalArea - a.totalArea).slice(0, 3);
  const top3Periods = new Set(top3.map(d => d.period));

  // Add context about major fires in each period
  const periodContext: Record<string, string> = {
    "2015-2019": "Black Summer: Gospers Mountain (513k ha), Currowan (500k ha), Dunns Road (334k ha)",
    "2000-2004": "2003 Australian Alps fires (1.73M ha) - worst drought in 103 years",
    "1970-1974": "1974-75 season: Moolah-Corinya (1.17M ha) - largest fire contained by humans in NSW"
  };

  return Plot.plot({
    width,
    height: 400,
    marginTop: 50,
    marginLeft: 100,
    marginRight: 40,
    marginBottom: 60,
    x: {
      label: "5-Year Period",
      tickRotate: -45
    },
    y: {
      label: "Total Area Burnt (hectares)",
      grid: true,
      tickFormat: "~s"
    },
    marks: [
      Plot.barY(periodData, {
        x: "period",
        y: "totalArea",
        fill: (d: any) => top3Periods.has(d.period) ? colors.accent1 : "#d4b5f7",
        inset: 5,
        tip: true
      }),
      Plot.ruleY([0]),
      // Add annotations for top 3
      Plot.dot(top3, {
        x: "period",
        y: "totalArea",
        r: 5,
        fill: colors.wildfire,
        stroke: "white",
        strokeWidth: 2
      }),
      Plot.text(top3, {
        x: "period",
        y: "totalArea",
        text: (d: any) => `${(d.totalArea / 1000000).toFixed(1)}M ha`,
        dy: -20,
        fontSize: 13,
        fontWeight: "bold",
        fill: colors.wildfire
      }),
      Plot.text(top3, {
        x: "period",
        y: "totalArea",
        text: (d: any) => periodContext[d.period] || "",
        dy: -40,
        fontSize: 8.5,
        fill: colors.muted,
        fontStyle: "italic",
        lineWidth: 18
      })
    ]
  });
}
