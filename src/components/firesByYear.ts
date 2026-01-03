import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import {colorScales} from "./colors.ts";

interface FireData {
  StartDate?: string;
  AreaHa?: number;
  d_FireType?: string;
  Label?: string;
  FireName?: string | null;
}

interface ChartOptions {
  width?: number;
  title?: string;
  subtitle?: string;
}

interface YearlyCount {
  year: number;
  count: number;
}

interface TrendPoint {
  year: number;
  trend: number;
}

export function firesByYear(
  fires: FireData[], 
  {width}: ChartOptions = {}
) {
  // Filter wildfires only (excluding prescribed burns)
  const wildfiresData = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024 && d.d_FireType !== "Prescribed Burn";
  });

  // Filter prescribed burns only
  const prescribedBurnsData = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024 && d.d_FireType === "Prescribed Burn";
  });

  // Process wildfire data
  const wildfiresByYear = d3.rollup(
    wildfiresData,
    v => v.length,
    d => new Date(d.StartDate!).getFullYear()
  );

  const wildfireYearlyData: YearlyCount[] = Array.from(wildfiresByYear, ([year, count]) => ({
    year,
    count
  })).sort((a, b) => a.year - b.year);

  // Calculate wildfire trend line
  const n1 = wildfireYearlyData.length;
  const sumX1 = d3.sum(wildfireYearlyData, d => d.year);
  const sumY1 = d3.sum(wildfireYearlyData, d => d.count);
  const sumXY1 = d3.sum(wildfireYearlyData, d => d.year * d.count);
  const sumX2_1 = d3.sum(wildfireYearlyData, d => d.year * d.year);

  const slope1 = (n1 * sumXY1 - sumX1 * sumY1) / (n1 * sumX2_1 - sumX1 * sumX1);
  const intercept1 = (sumY1 - slope1 * sumX1) / n1;

  const wildfireTrendData: TrendPoint[] = wildfireYearlyData.map(d => ({
    year: d.year,
    trend: slope1 * d.year + intercept1
  }));

  // Process prescribed burns data
  const prescribedBurnsByYear = d3.rollup(
    prescribedBurnsData,
    v => v.length,
    d => new Date(d.StartDate!).getFullYear()
  );

  const prescribedYearlyData: YearlyCount[] = Array.from(prescribedBurnsByYear, ([year, count]) => ({
    year,
    count
  })).sort((a, b) => a.year - b.year);

  // Calculate prescribed burns trend line
  const n2 = prescribedYearlyData.length;
  const sumX2 = d3.sum(prescribedYearlyData, d => d.year);
  const sumY2 = d3.sum(prescribedYearlyData, d => d.count);
  const sumXY2 = d3.sum(prescribedYearlyData, d => d.year * d.count);
  const sumX2_2 = d3.sum(prescribedYearlyData, d => d.year * d.year);

  const slope2 = (n2 * sumXY2 - sumX2 * sumY2) / (n2 * sumX2_2 - sumX2 * sumX2);
  const intercept2 = (sumY2 - slope2 * sumX2) / n2;

  const prescribedTrendData: TrendPoint[] = prescribedYearlyData.map(d => ({
    year: d.year,
    trend: slope2 * d.year + intercept2
  }));

  // Combine the data for stacked/grouped visualization
  const combinedData = [
    ...wildfireYearlyData.map(d => ({...d, type: "Wildfire"})),
    ...prescribedYearlyData.map(d => ({...d, type: "Prescribed Burn"}))
  ];

  return Plot.plot({
    width,
    height: 300,
    marginTop: 30,
    marginLeft: 60,
    y: {
      label: "Number of fires",
      grid: true
    },
    x: {
      label: null,
      tickFormat: "d",
      ticks: d3.range(1970, 2026, 10)
    },
    color: {
      legend: true,
      ...colorScales.fireType
    },
    marks: [
      Plot.lineY(wildfireYearlyData, {
        x: "year",
        y: "count",
        stroke: "#ff8ab7",
        strokeWidth: 2.5,
        curve: "natural",
        tip: true
      }),
      Plot.dot(wildfireYearlyData, {
        x: "year",
        y: "count",
        fill: "#ff8ab7",
        r: 3
      }),
      Plot.lineY(prescribedYearlyData, {
        x: "year",
        y: "count",
        stroke: "#a463f2",
        strokeWidth: 2.5,
        curve: "natural",
        tip: true
      }),
      Plot.dot(prescribedYearlyData, {
        x: "year",
        y: "count",
        fill: "#a463f2",
        r: 3
      }),
      Plot.ruleY([0])
    ]
  });
}
