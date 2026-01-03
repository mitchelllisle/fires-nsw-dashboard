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

interface YearlyArea {
  year: number;
  area: number;
}

export function areaBurntByYear(
  fires: FireData[],
  {width}: ChartOptions = {}
) {
  // Filter and separate wildfires and prescribed burns
  const wildfiresData = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024 && d.d_FireType !== "Prescribed Burn";
  });

  const prescribedBurnsData = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024 && d.d_FireType === "Prescribed Burn";
  });

  // Aggregate area by year for wildfires
  const wildfiresByYear = d3.rollup(
    wildfiresData,
    v => d3.sum(v, d => d.AreaHa || 0),
    d => new Date(d.StartDate!).getFullYear()
  );

  const wildfireYearlyData: YearlyArea[] = Array.from(wildfiresByYear, ([year, area]) => ({
    year,
    area,
    type: "Wildfire"
  })).sort((a, b) => a.year - b.year);

  // Aggregate area by year for prescribed burns
  const prescribedBurnsByYear = d3.rollup(
    prescribedBurnsData,
    v => d3.sum(v, d => d.AreaHa || 0),
    d => new Date(d.StartDate!).getFullYear()
  );

  const prescribedYearlyData: YearlyArea[] = Array.from(prescribedBurnsByYear, ([year, area]) => ({
    year,
    area,
    type: "Prescribed Burn"
  })).sort((a, b) => a.year - b.year);

  // Combine the data
  const combinedData = [...wildfireYearlyData, ...prescribedYearlyData];

  return Plot.plot({
    width,
    height: 300,
    marginTop: 0,
    marginLeft: 80,
    y: {
      label: "Area burnt (hectares)",
      grid: true,
      tickFormat: "~s"
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
      Plot.areaY(combinedData, {
        x: "year",
        y: "area",
        fill: "type",
        fillOpacity: 0.6,
        tip: true
      }),
      Plot.lineY(combinedData, {
        x: "year",
        y: "area",
        stroke: "type",
        strokeWidth: 2
      }),
      Plot.ruleY([0])
    ]
  });
}
