import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import {colors} from "./colors.js";

interface FireData {
  StartDate?: string;
  AreaHa?: number;
  Label?: string;
  d_FireType?: string;
  longitude?: number;
  latitude?: number;
}

interface ChartOptions {
  width?: number;
}

interface SuburbFeature {
  type: string;
  properties: {
    name?: string;
    nsw_loca_2?: string;
  };
  geometry: any;
}

// Simple point-in-polygon check for a single point
function isPointInPolygon(point: [number, number], polygon: any): boolean {
  const [x, y] = point;
  const coords = polygon.type === "Polygon" ? polygon.coordinates[0] : polygon.coordinates[0][0];
  
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Convert text to title case
function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// Find suburb name for a fire location
function findSuburbForFire(fire: FireData, suburbs: SuburbFeature[]): string {
  const point: [number, number] = [fire.longitude!, fire.latitude!];
  
  // Try to find the suburb containing this point
  for (const suburb of suburbs) {
    if (suburb.geometry && isPointInPolygon(point, suburb.geometry)) {
      const name = suburb.properties.name || suburb.properties.nsw_loca_2 || "Unknown";
      return toTitleCase(name);
    }
  }
  
  // If no exact match, find nearest suburb by distance to centroid
  let nearest = null;
  let minDist = Infinity;
  
  for (const suburb of suburbs) {
    if (!suburb.geometry) continue;
    
    const centroid = d3.geoCentroid(suburb);
    const dist = Math.sqrt(
      Math.pow(centroid[0] - fire.longitude!, 2) +
      Math.pow(centroid[1] - fire.latitude!, 2)
    );
    
    if (dist < minDist) {
      minDist = dist;
      nearest = suburb.properties.name || suburb.properties.nsw_loca_2;
    }
  }
  
  return nearest ? toTitleCase(nearest) : "Unknown";
}

export function regionalHotspots(
  fires: FireData[],
  nswSuburbs: { features: SuburbFeature[] },
  {width}: ChartOptions = {}
) {
  // Filter valid fires with location data
  const validFires = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    if (!d.longitude || !d.latitude) return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024;
  });

  // Sample fires for performance (check every 10th fire for region assignment)
  const sampledFires = validFires.filter((_, i) => i % 10 === 0);
  
  // Map each fire to a region (suburb name)
  const firesWithRegion = sampledFires.map(fire => ({
    ...fire,
    region: findSuburbForFire(fire, nswSuburbs.features)
  }));

  // Group by region and count
  const locationData = Array.from(
    d3.rollup(
      firesWithRegion,
      (v: any[]) => ({
        count: v.length,
        totalArea: d3.sum(v, (d: any) => d.AreaHa || 0)
      }),
      (d: any) => d.region
    ),
    ([location, data]: [string, any]) => ({
      location,
      count: data.count,
      totalArea: data.totalArea
    })
  )
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);

  return Plot.plot({
    width,
    height: 300,
    marginTop: 30,
    marginLeft: 170,
    marginRight: 40,
    x: {
      label: "Number of fires",
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(locationData, {
        x: "count",
        y: "location",
        fill: colors.accent1,
        sort: {y: "-x"},
        tip: true
      }),
      Plot.ruleX([0])
    ]
  });
}
