# NSW Bushfires Dashboard - Observable Framework

This is an Observable Framework dashboard for visualizing NSW bushfires data.

## Data Sources
- NSW DPIE Fire History - Wildfires and Prescribed Burns dataset
- URL: https://datasets.seed.nsw.gov.au/dataset/fire-history-wildfires-and-prescribed-burns-1e8b6
- Fire research data: `src/data/biggest-fires-research.json` with detailed context for major fires

## Project Structure
```
src/
├── index.md              # Main dashboard page with visualizations
├── data/                 # Data files (JSON, no loaders)
│   ├── fires-with-coords.json      # Main fire dataset (11MB, 37,007 records)
│   ├── australia-states.json       # NSW suburb boundaries for geocoding (8.12MB)
│   └── biggest-fires-research.json # Research data for annotations
└── components/           # Reusable TypeScript visualization components
    ├── colors.ts         # Color palette (purple #a463f2, coral #ff8ab7)
    ├── firesByYear.ts    # Fire count time series
    ├── fireMap.ts        # Interactive map with year slider
    ├── areaBurntByYear.ts # Area burnt time series
    ├── seasonalHeatmap.ts # Monthly fire frequency heatmap
    ├── regionalHotspots.ts # Top 10 regions with reverse geocoding
    ├── intensePeriods.ts # 5-year period analysis with annotations
    ├── bigFiresScatter.ts # Mega-fires (>50k ha) scatter plot
    └── topLargestFires.ts # Top 10 largest fires bar chart
```

## Key Visualizations
1. **Where Do Fires Occur?** - Interactive map with year slider showing fire locations
2. **Fire Activity Over Time** - Time series of fire counts (1970-2024)
3. **Which Periods Were Most Destructive?** - 5-year period analysis highlighting worst periods
4. **When During the Year?** - Monthly heatmap showing seasonal patterns
5. **Which Areas Most Affected?** - Top 10 regions using suburb names (reverse geocoding)
6. **How Much Land Burns?** - Area burnt time series with dual-axis for fire types
7. **When Do Mega-Fires Happen?** - Scatter plot of fires >50,000 ha with annotations
8. **Largest Fires Ever?** - Bar chart of top 10 with research context

## Design Principles

### Color Palette
- **ALL colors defined centrally in `src/components/colors.ts`**
- Primary colors:
  - `colors.wildfire` - For wildfires and wildfire-related data
  - `colors.prescribedBurn` - For prescribed burns and prescribed burn data
  - `colors.accent1`, `colors.accent2`, `colors.accent3` - Accent colors
- Lighter variants available: `wildfireLighter`, `prescribedBurnLighter`, `accent3Lighter`
- **NEVER hardcode hex colors** - always import and use from `colors` object
- Use `colorScales.fireType` for consistent fire type color mapping
- Use `generateSequentialScale(targetColor)` for heatmaps and gradients
- To change the entire dashboard palette, edit only `colors.ts`

### Chart Titles & Content
- All chart titles should be **questions** that the visualization answers
- Include 2-3 sentence subtitles with key insights from the data
- Example: "When Do Mega-Fires Happen?" with subtitle about largest fires occurring in summer months

### Annotations
- Use Plot.text, Plot.dot, and Plot.link for annotations
- Include fire context from `biggest-fires-research.json`
- Position text above data points with connecting lines (markerStart: "dot")
- Key annotations:
  - intensePeriods: Top 3 worst 5-year periods with fire names
  - bigFiresScatter: Largest fires from 1970s, 2000s, and 2019-2020

### Introduction Paragraph
- Keep concise and engaging (3 paragraphs)
- Use dynamic data: `${totalFires.toLocaleString()}`, `${d3.format(".2s")(totalAreaHa)}`
- Highlight key statistics with:
  - **Bold** for emphasis (fire names, key statements)
  - *Italics* for unique descriptors ("largest from a single ignition point")
  - <span style="color: #a463f2">Colored text</span> for important numbers
- Set `max-width: none` on paragraphs for full-width layout

### Regional Hotspots
- Uses reverse geocoding to convert coordinates to NSW suburb names
- Algorithm: Point-in-polygon check first, then nearest-distance fallback
- Samples every 10th fire for performance (3,700 checks)
- Converts names to title case with `toTitleCase()` function
- Requires NSW suburb GeoJSON passed as parameter

### Data Loading
- **No data loaders** - use direct FileAttachment for JSON files
- Keep data files in `src/data/` (not `src/data/static/`)
- Fire dataset fields: FireType, FireName, StartDate, EndDate, AreaHa, longitude, latitude

## Technology Stack
- Observable Framework v1.13.3
- D3.js for data manipulation
- Observable Plot for declarative charts
- TypeScript for all component files
- Content-based hash caching (may need cache invalidation: `rm -rf src/.observablehq/cache`)

## Deployment
- GitHub Actions workflow in `.github/workflows/deploy.yml`
- Deploys to GitHub Pages on push to main branch
- Manual trigger available via workflow_dispatch

## Important Notes
- Observable Framework uses aggressive content-based caching
- If data files don't update, clear cache: `rm -rf src/.observablehq/cache` or `rm -rf dist`
- All components use TypeScript (`.ts` extension)
- Import colors from `"./colors.ts"` (not `.js`)
- Fire data filtered to 1970-2024 (excluding invalid 1899 dates)
