import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";

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

export function firesByLocation2025(
  fires: FireData[], 
  {width, title = "2025 Fire Distribution", subtitle = "Analyzing the spike in fire activity this year"}: ChartOptions = {}
) {
  // Filter fires from 2025
  const fires2025 = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    const year = new Date(d.StartDate).getFullYear();
    return year === 2025;
  });

  // Group by Label to see fire seasons/regions
  const firesByLabel = d3.rollup(
    fires2025,
    v => ({
      count: v.length,
      totalArea: d3.sum(v, d => d.AreaHa || 0)
    }),
    d => d.Label || "Unknown"
  );

  const chartData = Array.from(firesByLabel, ([label, data]) => ({
    label,
    count: data.count,
    totalArea: data.totalArea
  }))
  .filter(d => d.label !== "Unknown")
  .sort((a, b) => b.count - a.count)
  .slice(0, 15); // Top 15

  return Plot.plot({
    title,
    subtitle,
    width,
    marginLeft: 200,
    marginBottom: 50,
    x: {
      label: "Number of fires",
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(chartData, {
        y: "label",
        x: "count",
        fill: "#ff6b6b",
        tip: true,
        sort: {y: "-x"}
      }),
      Plot.text(chartData, {
        y: "label",
        x: "count",
        text: d => d.count.toString(),
        textAnchor: "start",
        dx: 5
      })
    ]
  });
}
