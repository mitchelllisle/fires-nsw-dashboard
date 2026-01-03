# NSW Bushfires Dashboard

An Observable Framework dashboard visualizing the history of bushfires in NSW, Australia.

## Overview

This dashboard presents insights into bushfire patterns in NSW from 1970 to present, based on data from the NSW Department of Planning, Industry and Environment. The visualizations show:

- Number of fires per fire season
- Total area burnt over time
- Geographic distribution of fires
- Frequency by season and month
- Analysis of large fires (>50,000 hectares)

## Data Source

**NSW DPIE Fire History - Wildfires and Prescribed Burns**
- URL: https://datasets.seed.nsw.gov.au/dataset/fire-history-wildfires-and-prescribed-burns-1e8b6
- Coverage: NSW national parks, reserves, and immediate surrounds
- Time period: 1902-present (analysis focuses on 1970+)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

This will start the Observable Framework preview server. Open your browser to the URL shown (typically http://localhost:3000).

### Building

Build the static site:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
fires-nsw-dashboard/
├── src/
│   ├── index.md          # Main dashboard page
│   ├── dashboard.css     # Custom styles
│   └── data/
│       └── fires.json.js # Data loader for fire data
├── observablehq.config.js # Framework configuration
├── package.json
└── README.md
```

## Key Insights

### Are Bushfires Becoming More Common?

The data reveals several important trends:

1. **Frequency**: Slight increase from 1970 to early 2000s, then stabilization
2. **Intensity**: Significant variation with multiple years exceeding 1M hectares
3. **Timing**: More fires occurring throughout the year, not just traditional seasons
4. **Size**: Large fires (>50,000 ha) becoming more common after 2000

### Notable Fire Seasons

- **2002-03**: Peak year with 1,326 wildfires (Millennium Drought)
- **2019-20**: Unprecedented early season with 2.7M+ hectares burnt

## Technology Stack

- **Observable Framework** - Dashboard framework
- **Observable Plot** - Data visualization
- **D3.js** - Data manipulation
- **Arquero** - Data wrangling (optional)

## Future Enhancements

- Connect to live NSW DPIE API
- Add interactive map with fire locations
- Cross-reference with BOM rainfall and temperature data
- Add filtering by region and fire type
- Export and download capabilities

## Credits

This dashboard was inspired by the [Salsa Digital Open Data Insights](https://salsa.digital/insights/history-of-bushfires-in-nsw) analysis of NSW bushfire data.

Data provided by NSW Department of Planning, Industry and Environment.

## License

This project is for educational and informational purposes.
