---
title: NSW Bushfires Dashboard
toc: false
theme: dashboard
---

# History of Bushfires in NSW

```js
import {firesByYear} from "./components/firesByYear.js";
import {fireMap} from "./components/fireMap.js";
import {areaBurntByYear} from "./components/areaBurntByYear.js";
import {seasonalHeatmap} from "./components/seasonalHeatmap.js";
import {regionalHotspots} from "./components/regionalHotspots.js";
import {bigFiresScatter} from "./components/bigFiresScatter.js";
import {topLargestFires} from "./components/topLargestFires.js";
import {intensePeriods} from "./components/intensePeriods.js";
import {colors} from "./components/colors.js";
```

```js
// Load fire data with coordinates
const fires = await FileAttachment("data/fires-with-coords.json").json();
const nswSuburbs = await FileAttachment("data/australia-states.json").json();
```

```js
// Calculate summary statistics
const validFires = fires.filter(d => {
  if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
  const year = new Date(d.StartDate).getFullYear();
  return year >= 1970 && year <= 2024;
});

const totalFires = validFires.length;
const totalAreaHa = d3.sum(validFires, d => d.AreaHa || 0);
const wildfires = validFires.filter(d => d.d_FireType !== "Prescribed Burn");
const prescribedBurns = validFires.filter(d => d.d_FireType === "Prescribed Burn");
const largestFire = d3.greatest(validFires, d => d.AreaHa || 0);
```

```js
// Year slider for map filtering
const yearSliderInput = Inputs.range([1970, 2024], {
  label: null,
  value: 2024,
  step: 1,
  width: 150
});

// Hide the number input, keep only slider
yearSliderInput.querySelector("input[type=number]").remove();

const selectedYear = Generators.input(yearSliderInput);
```

```js
// Helper function to center resize content
function centerResize(render) {
  const div = resize(render);
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.alignItems = "center";
  return div;
}
```

```js
// Filter fires for map based on selected year
const filteredFires = fires.filter(d => {
  if (!d.StartDate || d.StartDate === "1899-11-29T14:00:00.000Z") return false;
  const year = new Date(d.StartDate).getFullYear();
  return year === selectedYear;
});
```

```js
html`<p style="max-width: none;">Bushfires are an intrinsic part of the Australian landscape, but their scale and intensity have reached unprecedented levels in recent decades. Since 1970, NSW has recorded over <strong>${totalFires.toLocaleString("en-US")} fire events</strong>, burning more than <span style="color: ${colors.accent1}; font-weight: 600;">${d3.format(".2s")(totalAreaHa)} hectares</span>. The 2019-2020 Black Summer marked a catastrophic turning point: the <strong>Gospers Mountain</strong> fire, started by a single lightning strike, ultimately burned <span style="color: ${colors.wildfire}; font-weight: 600;">512,626 hectares</span> (including significant area from escaped backburning operations), generating fire-generated thunderstorms and merging with five other fires into a megablaze exceeding one million hectares.</p>`
```

```js
html`<p style="max-width: none;">The human toll of these fires is devastating. The deadliest NSW fires since 1970 include the <strong>Badja Forest Road fire</strong> (2019-2020) which claimed <span style="color: ${colors.wildfire}; font-weight: 600;">6 lives</span> including volunteer firefighter Colin Burns, and destroyed <strong>418 homes</strong> around Cobargo on New Year's Eve 2019. The <strong>Green Wattle Creek fire</strong> (2019) killed two volunteer firefighters—Geoffrey Keaton (32) and Andrew O'Dwyer (36)—when a tree struck their tanker, and nearly destroyed the village of Balmoral. Across the Black Summer fires, <strong>over 2,400 homes were destroyed</strong>, with many ignited by lightning strikes in remote, inaccessible bushland during unprecedented drought conditions.</p>`
```

```js
html`<p style="max-width: none;">The data reveals a troubling pattern: <strong>the most destructive periods have all occurred since 2000</strong>. The 2015-2020 period saw the most area burnt, driven by Black Summer's trio of mega-fires (2019-2020). The 2000-2004 period ranks second with the 2003 Australian Alps fires burning <span style="color: ${colors.accent3}; font-weight: 600;">1.73 million hectares</span> during Australia's worst drought in 103 years.</p>`
```

```js
html`<p style="max-width: none; margin-bottom: 2rem;">As climate change intensifies, fire seasons <strong>start earlier, last longer, and burn with unprecedented ferocity</strong>. Understanding this historical data isn't just about looking back—it's about preparing for an increasingly fire-prone future.</p>`
```

```js
html`<div class="grid grid-cols-4">
  <div class="card">
    <h2 style="font-weight: 700;">Total Fires</h2>
    <span class="big" style="background: linear-gradient(135deg, ${colors.accent2} 0%, ${colors.prescribedBurn} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${totalFires.toLocaleString("en-US")}</span>
    <div style="font-size: 0.85rem; margin-top: 0.25rem; font-weight: 600; background: linear-gradient(135deg, ${colors.accent2} 0%, ${colors.prescribedBurn} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">⌕ ${Math.round(totalFires / 55).toLocaleString("en-US")} avg/year</div>
  </div>
  <div class="card">
    <h2 style="font-weight: 700;">Total Area Burnt</h2>
    <span class="big" style="color: ${colors.accent3};">${d3.format(".2s")(totalAreaHa)}</span> hectares
    <div style="font-size: 0.85rem; margin-top: 0.25rem; font-weight: 600; color: ${colors.accent3};">≈ ${d3.format(".2f")((totalAreaHa / 769000000) * 100)}% of Australia</div>
  </div>
  <div class="card">
    <h2 style="font-weight: 700; color: ${colors.wildfire};">Wildfires</h2>
    <span class="big" style="color: ${colors.wildfire};">${wildfires.length.toLocaleString("en-US")}</span>
    <div style="font-size: 0.85rem; margin-top: 0.25rem; font-weight: 600; color: ${colors.wildfire};">▲ ${d3.format(".2s")(d3.sum(wildfires, d => d.AreaHa))} hectares burnt</div>
  </div>
  <div class="card">
    <h2 style="font-weight: 700; color: ${colors.prescribedBurn};">Prescribed Burns</h2>
    <span class="big" style="color: ${colors.prescribedBurn};">${prescribedBurns.length.toLocaleString("en-US")}</span>
    <div style="font-size: 0.85rem; margin-top: 0.25rem; font-weight: 600; color: ${colors.prescribedBurn};">◉ ${d3.format(".2s")(d3.sum(prescribedBurns, d => d.AreaHa))} hectares burnt</div>
  </div>
</div>`
```

<div class="grid grid-cols-4">
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Where Do Fires Occur Across NSW?</h2>
    <h3>Fires cluster heavily along the coastal ranges where eucalypt forests meet urban development. ${selectedYear} recorded ${filteredFires.length.toLocaleString("en-US")} fire events.</h3>
    <figure style="max-width: none;">
      <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 0.5rem;">
        <h1 style="margin: 0.25rem 0;">${selectedYear}</h1>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div>1970</div>
          ${yearSliderInput}
          <div>2024</div>
        </div>
      </div>
      ${centerResize((width, height) => fireMap(filteredFires, nswSuburbs, {width, height}))}
    </figure>
  </div>
  <div class="card grid-colspan-2">
    <h2>How Has Fire Activity Changed Over Time?</h2>
    <h3>Wildfire frequency spikes during major drought years, particularly 2001-2002 and 2019-2020. Prescribed burns maintain a relatively steady baseline for hazard reduction.</h3>
    ${resize((width) => firesByYear(fires, {width}))}
  </div>
  <div class="card grid-colspan-2">
    <h2>Which Periods Were Most Destructive?</h2>
    <h3>2015-2020 saw the most area burnt in any 5-year period, driven by the catastrophic Black Summer fires (2019-2020). The 2000-2004 period ranks second due to severe drought conditions.</h3>
    ${resize((width) => intensePeriods(fires, {width}))}
  </div>
</div>

<div class="grid grid-cols-4" style="grid-auto-rows: 420px;">
  <div class="card grid-colspan-2">
    <h2>When During the Year Do Fires Occur?</h2>
    <h3>Summer and early autumn (December-March) see the highest fire activity. The 2019-2020 season broke patterns with unprecedented late-spring activity.</h3>
    ${resize((width) => seasonalHeatmap(fires, {width}))}
  </div>
  <div class="card grid-colspan-2">
    <h2>Which Areas Experience the Most Fires?</h2>
    <h3>Fires concentrate in regions combining dense bushland, dry conditions, and proximity to populated areas. The Blue Mountains and Central Coast are among the most fire-prone.</h3>
    ${resize((width) => regionalHotspots(fires, nswSuburbs, {width}))}
  </div>
</div>

<div class="grid grid-cols-2" style="grid-auto-rows: 520px;">
  <div class="card">
    <h2>How Much Land Burns Each Year?</h2>
    <h3>The 2019-2020 Black Summer fires burnt over 5 million hectares, dwarfing all previous years. Prescribed burns typically clear 200,000-400,000 hectares annually for fuel reduction.</h3>
    ${resize((width) => areaBurntByYear(fires, {width}))}
  </div>
  <div class="card">
    <h2>When Do Mega-Fires Happen?</h2>
    <h3>Only 87 fires since 1970 have exceeded 50,000 hectares. Most occur in summer (Dec-Feb) when temperatures peak and fuel is driest. The worst fires have exhibited extreme behaviors including fire tornadoes (2003), 60-meter flame heights (2003), and runs exceeding 80 kilometers in a single day (2019).</h3>
    ${resize((width) => bigFiresScatter(fires, {width}))}
  </div>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    <h2>What Were the Largest Fires Ever Recorded?</h2>
    <h3>The top 10 fires by area reveal catastrophic human impacts. Dot size reflects combined severity from casualties, homes destroyed, area, and injuries. Nearly all sparked by lightning in remote bushland during extreme drought.</h3>
    ${topLargestFires(fires, {width: 1100, nswSuburbs})}
  </div>
</div>

<div class="note" style="max-width: none;">

## Data Sources & Disclaimer

This dashboard is built for **educational purposes** to explore patterns in NSW fire history. Every effort has been made to research and verify information from official sources, historical records, and inquiries. However, it should not be considered a definitive historical record.

**Data Source:** [NSW DPIE Fire History - Wildfires and Prescribed Burns](https://datasets.seed.nsw.gov.au/dataset/fire-history-wildfires-and-prescribed-burns-1e8b6) dataset. **Limitations:** Historical records vary in accuracy (especially pre-1990s), fire boundaries are approximations, casualty data compiled from multiple sources may be incomplete, and merged fires complicate individual attribution. This dashboard illuminates general trends, not forensic detail.

</div>