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

<p style="max-width: none;">Bushfires are an intrinsic part of the Australian landscape, but their scale and intensity have reached unprecedented levels in recent decades. Since 1970, NSW has recorded over <strong>${totalFires.toLocaleString("en-US")} fire events</strong>, burning more than <span style="color: #a463f2; font-weight: 600;">${d3.format(".2s")(totalAreaHa)} hectares</span>. The 2019-2020 Black Summer marked a catastrophic turning point: the <strong>Gospers Mountain</strong> fire became the <em>largest from a single ignition point</em> in Australian history at <span style="color: #ff8ab7; font-weight: 600;">512,626 hectares</span>, generating fire-generated thunderstorms and merging with five other fires into a megablaze exceeding one million hectares.</p>

<p style="max-width: none;">The data reveals a troubling pattern: <strong>the most destructive periods have all occurred since 2000</strong>. The 2015-2019 period saw the most area burnt, driven by Black Summer's trio of mega-fires. The 2000-2004 period ranks second with the 2003 Australian Alps fires burning <span style="color: #a463f2; font-weight: 600;">1.73 million hectares</span> during Australia's worst drought in 103 years.</p>

<p style="max-width: none; margin-bottom: 2rem;">As climate change intensifies, fire seasons <strong>start earlier, last longer, and burn with unprecedented ferocity</strong>. Understanding this historical data isn't just about looking back—it's about preparing for an increasingly fire-prone future.</p>

<div class="grid grid-cols-4">
  <div class="card">
    <h2 style="font-weight: 700;">Total Fires</h2>
    <span class="big">${totalFires.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2 style="font-weight: 700;">Total Area Burnt</h2>
    <span class="big">${d3.format(".2s")(totalAreaHa)}</span> hectares
  </div>
  <div class="card">
    <h2 style="font-weight: 700; color: #ff8ab7;">Wildfires</h2>
    <span class="big" style="color: #ff8ab7;">${wildfires.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2 style="font-weight: 700; color: #a463f2;">Prescribed Burns</h2>
    <span class="big" style="color: #a463f2;">${prescribedBurns.length.toLocaleString("en-US")}</span>
  </div>
</div>

<div class="grid grid-cols-4">
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Where Do Fires Occur Across NSW?</h2>
    <h3>${filteredFires.length.toLocaleString("en-US")} fire events in ${selectedYear}. Fires cluster heavily along the coastal ranges where eucalypt forests meet urban development.</h3>
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
    <h3>2015-2019 saw the most area burnt in any 5-year period, driven by the catastrophic Black Summer fires. The 2000-2004 period ranks second due to severe drought conditions.</h3>
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
    <h3>The Blue Mountains and Central Coast dominate fire frequency records. These regions combine dense bushland, dry conditions, and proximity to populated areas.</h3>
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
    <h3>Only 87 fires since 1970 have exceeded 50,000 hectares. The Gospers Mountain fire traveled nearly 12km in less than 3 hours at peak intensity and merged with other blazes to exceed 1 million hectares.</h3>
    ${resize((width) => bigFiresScatter(fires, {width}))}
  </div>
</div>

<div class="grid grid-cols-2" style="grid-auto-rows: 520px;">
  <div class="card">
    <h2>What Were the Largest Fires Ever Recorded?</h2>
    <h3>The Gospers Mountain fire (2019) was the largest from a single ignition point in Australian history at 512,626 hectares. It generated pyrocumulonimbus clouds and merged with 5 other fires to create a megablaze exceeding 1 million hectares.</h3>
    ${resize((width) => topLargestFires(fires, {width}))}
  </div>
</div>
