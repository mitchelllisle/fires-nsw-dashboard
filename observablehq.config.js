// See https://observablehq.com/framework/config for documentation.
export default {
  base: "/fires-nsw-dashboard",
  pages: [
    {name: "Overview", path: "/index"},
  ],
  style: "dashboard.css",
  footer: "Data source: <a href='https://datasets.seed.nsw.gov.au/dataset/fire-history-wildfires-and-prescribed-burns-1e8b6'>NSW DPIE Fire History</a>",
  root: "src",
  theme: ["dashboard", "midnight"],
  sidebar: false,
};
