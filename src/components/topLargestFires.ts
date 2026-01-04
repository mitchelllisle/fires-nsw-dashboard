import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import {colors} from "./colors.js";

interface FireData {
  StartDate?: string;
  AreaHa?: number;
  FireName?: string | null;
  d_FireType?: string;
  longitude?: number;
  latitude?: number;
}

interface FireResearchData {
  deaths: number;
  homes: number;
  injuries: number | null;
  cause: string;
  summary: string;
}

// Comprehensive research data for major fires
const fireResearch: Record<string, FireResearchData> = {
  "Gospers Mountain (2019)": {
    deaths: 0,
    homes: 90,
    injuries: null,
    cause: "Lightning strike in inaccessible bushland",
    summary: "Started by a single lightning strike but grew significantly (130,000+ ha) due to escaped backburning operations. Generated pyrocumulonimbus clouds and merged with 5 other fires into a megablaze exceeding 1 million hectares. Threatened Sydney's northern suburbs."
  },
  "Currowan 2 (2019)": {
    deaths: 3,
    homes: 312,
    injuries: 1,
    cause: "Lightning strike in drought-affected bushland",
    summary: "Known as 'The Forever Fire' for its 74-day duration. 89 homes destroyed in Conjola Park on New Year's Eve. All 3 deaths occurred at Lake Conjola area."
  },
  "Badja Forest Rd, Countegany (2019)": {
    deaths: 6,
    homes: 418,
    injuries: null,
    cause: "Lightning strike in Badja State Forest",
    summary: "Traveled 40km in hours under catastrophic conditions. Flame heights 15-20 meters. Deaths included firefighter Colin Burns and father-son Robert & Patrick Salway defending their farm. 60% of Bega Valley Shire burned."
  },
  "Dunns Road (2019)": {
    deaths: 1,
    homes: 186,
    injuries: null,
    cause: "Lightning strike in pine plantation",
    summary: "Ran 85km in two days. David Harrison (47) died defending friend's property near Batlow. Merged into 600,000-hectare megafire. Heritage-listed Kiandra Courthouse destroyed."
  },
  "Green Wattle Creek (2019)": {
    deaths: 2,
    homes: 40,
    injuries: 5,
    cause: "Lightning strikes in Burragorang Valley",
    summary: "Killed volunteer firefighters Geoffrey Keaton (32) and Andrew O'Dwyer (36) when tree struck their tanker. Nearly destroyed Balmoral village. Burned through Sydney's water catchment area."
  },
  "Carrai Creek (2019)": {
    deaths: 1,
    homes: 90,
    injuries: null,
    cause: "Lightning strike",
    summary: "Barry Parsons died fleeing during 'firestorm' conditions. Burned through wilderness with poorly maintained fire trails. Significant koala habitat destroyed—71% population decline documented."
  },
  "Green Valley, Talmalmo (2019)": {
    deaths: 1,
    homes: 8,
    injuries: 2,
    cause: "Lightning strike",
    summary: "Volunteer firefighter Samuel McPaul (28) killed when pyrocumulonimbus collapse overturned his truck. Fire ran 85km before jumping Murray River into Victoria. Low home loss due to sparse population."
  },
  "Yarrowlumla S44 (2003)": {
    deaths: 4,
    homes: 470,
    injuries: 490,
    cause: "Lightning strike",
    summary: "Part of 2003 Canberra fires. Created first documented fire tornado in Australia. 45km fire runs in one day with 50-60 meter flame heights. 'Black Saturday' firestorm hit Canberra suburbs."
  },
  "Kosciuszko (2003)": {
    deaths: 4,
    homes: 551,
    injuries: 490,
    cause: "Lightning strikes (44 fires ignited)",
    summary: "Part of 2003 Alps fires during worst drought in 103 years. Area represents entire VIC-NSW-ACT complex. Fire came within meters of Perisher lodges. $121M tourism losses projected."
  },
  "Unnamed (1974)": {
    deaths: 6,
    homes: 40,
    injuries: null,
    cause: "Lightning strikes after heavy rainfall",
    summary: "Largest bushfire event ever recorded in Australia—burned 15% of continent. NSW component: 3.5M hectares including the Moolah-Corinya fire. Mostly in unpopulated interior. 57,000 livestock killed."
  }
};

interface ChartOptions {
  width?: number;
  nswSuburbs?: any;
}

export function topLargestFires(
  fires: FireData[],
  {width = 640, nswSuburbs}: ChartOptions = {}
) {
  // Filter valid fires with area data
  const validFires = fires.filter(d => {
    if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
    if (!d.AreaHa || d.AreaHa === 0) return false;
    const year = new Date(d.StartDate).getFullYear();
    return year >= 1970 && year <= 2024;
  });

  // Get all fires with research data and calculate impact scores
  const firesWithScores = validFires
    .map(d => {
      const fullName = `${d.FireName || "Unnamed"} (${new Date(d.StartDate!).getFullYear()})`;
      const research = fireResearch[fullName];
      const deaths = research?.deaths || 0;
      const homes = research?.homes || 0;
      const injuries = research?.injuries || 0;
      const area = d.AreaHa || 0;
      
      // Calculate impact score: deaths (very high weight), homes (medium), area (lower), injuries (low)
      const impactScore = (deaths * 10000) + (homes * 2) + (area / 1000) + (injuries * 100);
      
      return {
        name: d.FireName || "Unnamed",
        year: new Date(d.StartDate!).getFullYear(),
        area,
        label: fullName,
        deaths,
        homes,
        injuries,
        cause: research?.cause || "Unknown",
        summary: research?.summary || "",
        impactScore,
        longitude: d.longitude,
        latitude: d.latitude
      };
    })
    .sort((a, b) => b.impactScore - a.impactScore); // Sort by impact score, highest first

  // Deduplicate by fire label, keeping the highest impact score for each unique fire
  const uniqueFires = Array.from(
    firesWithScores.reduce((map, fire) => {
      if (!map.has(fire.label) || fire.impactScore > map.get(fire.label)!.impactScore) {
        map.set(fire.label, fire);
      }
      return map;
    }, new Map<string, typeof firesWithScores[0]>())
    .values()
  )
    .sort((a, b) => b.impactScore - a.impactScore) // Re-sort after deduplication
    .slice(0, 10);

  // Calculate score range for thresholds
  const impactScores = uniqueFires.map(f => f.impactScore);
  const minScore = Math.min(...impactScores);
  const maxScore = Math.max(...impactScores);
  
  // Determine impact level thresholds
  const range = maxScore - minScore;
  const criticalThreshold = minScore + (range * 0.66);
  const majorThreshold = minScore + (range * 0.33);
  
  // Create container
  const container = document.createElement("div");
  container.style.cssText = `width: 100%; margin-top: 1.5rem;`;
  
  uniqueFires.forEach((fire, i) => {
    const impactScore = fire.impactScore;
    
    // Determine impact level with distinct colors
    let impactLevel: string;
    let impactColor: string;
    if (impactScore >= criticalThreshold) {
      impactLevel = "CRITICAL";
      impactColor = "#dc2626"; // Red
    } else if (impactScore >= majorThreshold) {
      impactLevel = "MAJOR";
      impactColor = "#ea580c"; // Orange
    } else {
      impactLevel = "HIGH";
      impactColor = "#eab308"; // Yellow
    }
    
    // Create fire entry
    const entry = document.createElement("div");
    entry.style.cssText = "display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #595959ff;";
    
    // Create content
    const content = document.createElement("div");
    content.style.cssText = "flex: 1; min-width: 0;";
    
    const title = document.createElement("h3");
    title.style.cssText = `margin: 0 0 0.35rem 0; font-size: 0.95rem; font-weight: 700; color: ${colors.wildfire};`;
    
    const impactBadge = document.createElement("span");
    impactBadge.style.cssText = `display: inline-block; font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.4rem; margin-left: 0.5rem; border-radius: 3px; background: ${impactColor}; color: white; letter-spacing: 0.5px;`;
    impactBadge.textContent = impactLevel;
    
    title.textContent = `${fire.name} (${fire.year}) `;
    title.appendChild(impactBadge);
    
    const summary = document.createElement("p");
    summary.style.cssText = "margin: 0 0 0.4rem 0; font-size: 0.85rem; line-height: 1.45; color: #ddd;";
    summary.textContent = fire.summary;
    
    const stats = document.createElement("div");
    stats.style.cssText = "display: flex; gap: 1.25rem; font-size: 0.8rem; color: #666; font-weight: 600;";
    
    const areaSpan = document.createElement("span");
    areaSpan.style.color = colors.accent3;
    areaSpan.textContent = `▣ ${d3.format(",.0f")(fire.area)} ha`;
    
    const deathSpan = document.createElement("span");
    deathSpan.style.color = fire.deaths > 0 ? colors.wildfire : '#888';
    deathSpan.textContent = `• ${fire.deaths} ${fire.deaths === 1 ? 'death' : 'deaths'}`;
    
    const homeSpan = document.createElement("span");
    homeSpan.style.color = fire.homes > 0 ? colors.accent2 : '#888';
    homeSpan.textContent = `■ ${fire.homes} homes`;
    
    stats.appendChild(areaSpan);
    stats.appendChild(deathSpan);
    stats.appendChild(homeSpan);
    
    if (fire.injuries > 0) {
      const injurySpan = document.createElement("span");
      injurySpan.style.color = '#888';
      injurySpan.textContent = `+ ${fire.injuries} injured`;
      stats.appendChild(injurySpan);
    }
    
    content.appendChild(title);
    content.appendChild(summary);
    content.appendChild(stats);
    
    entry.appendChild(content);
    
    // Create tiny map if coordinates exist and nswSuburbs data is provided
    if (fire.longitude && fire.latitude && nswSuburbs) {
      const mapContainer = document.createElement("div");
      mapContainer.style.cssText = "flex-shrink: 0; width: 120px; height: 120px;";
      
      const miniMap = Plot.plot({
        width: 120,
        height: 120,
        margin: 0,
        style: {
          background: "transparent"
        },
        projection: {
          type: "mercator",
          domain: nswSuburbs,
          inset: 2
        },
        marks: [
          // NSW outline
          Plot.geo(nswSuburbs, {
            stroke: "#ddd",
            strokeWidth: 0.3,
            fill: "var(--theme-foreground-faintest)",
            fillOpacity: 1
          }),
          // Single fire dot
          Plot.dot([{lon: fire.longitude, lat: fire.latitude}], {
            x: "lon",
            y: "lat",
            fill: colors.wildfire,
            r: 7,
            stroke: "white",
            strokeWidth: 2.5,
            fillOpacity: 1
          })
        ]
      });
      
      mapContainer.appendChild(miniMap);
      entry.appendChild(mapContainer);
    }
    
    container.appendChild(entry);
  });
  
  return container;
}
