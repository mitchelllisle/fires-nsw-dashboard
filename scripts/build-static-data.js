#!/usr/bin/env node

/**
 * Build Static Data Files
 * 
 * This script generates the static JSON files needed for the dashboard:
 * 1. fires-with-coords.json - Fire data with coordinates from shapefile
 * 2. australia-states.json - NSW suburb boundaries from GitHub
 * 
 * After running this script, you can delete:
 * - src/data/*.shp, *.shx, *.dbf, *.prj files
 * - src/data/fires-with-coords.json.js
 * - src/data/australia-states.json.js
 */

import { spawn } from 'child_process';
import { mkdir, writeFile, copyFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔥 Building static data files for NSW Bushfires Dashboard...\n');

// Helper to run Observable data loader
function runDataLoader(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`📊 Running ${scriptPath}...`);
    const process = spawn('node', ['--input-type=module'], {
      cwd: dirname(join(projectRoot, scriptPath)),
      stdio: ['pipe', 'pipe', 'inherit']
    });

    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Read and execute the data loader script
    import(join('file://', projectRoot, scriptPath))
      .then(() => {
        process.stdin.end();
      })
      .catch(reject);

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        resolve(output);
      }
    });
  });
}

// Alternative: directly import and run the modules
async function generateFireData() {
  console.log('🔥 Generating fires-with-coords.json...');
  const module = await import('../src/data/fires-with-coords.json.js');
  // The module exports the data directly
  return module.default || module;
}

async function generateSuburbData() {
  console.log('🗺️  Fetching NSW suburb boundaries...');
  const response = await fetch("https://raw.githubusercontent.com/anthwri/GeoJson-Data/master/suburb-2-nsw.geojson");
  const nswSuburbs = await response.json();

  // Filter out Lord Howe Island
  nswSuburbs.features = nswSuburbs.features.filter(feature => 
    !feature.properties.nsw_loca_2?.toLowerCase().includes("lord howe") &&
    !feature.properties.name?.toLowerCase().includes("lord howe")
  );

  return nswSuburbs;
}

async function main() {
  try {
    // Create static data directory
    const staticDir = join(projectRoot, 'src', 'data', 'static');
    await mkdir(staticDir, { recursive: true });

    // Generate fire data
    console.log('\n📍 Step 1: Processing fire shapefile data...');
    const fireData = await generateFireData();
    const fireDataPath = join(staticDir, 'fires-with-coords.json');
    await writeFile(fireDataPath, JSON.stringify(fireData));
    console.log(`   ✅ Saved ${fireDataPath}`);
    console.log(`   📦 Size: ${(JSON.stringify(fireData).length / 1024 / 1024).toFixed(2)} MB`);

    // Generate suburb data
    console.log('\n📍 Step 2: Fetching NSW suburb boundaries...');
    const suburbData = await generateSuburbData();
    const suburbDataPath = join(staticDir, 'australia-states.json');
    await writeFile(suburbDataPath, JSON.stringify(suburbData));
    console.log(`   ✅ Saved ${suburbDataPath}`);
    console.log(`   📦 Size: ${(JSON.stringify(suburbData).length / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n✨ Static data files generated successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Update data loaders to use static files:');
    console.log('      - Change fires-with-coords.json.js to just import from static/fires-with-coords.json');
    console.log('      - Change australia-states.json.js to just import from static/australia-states.json');
    console.log('   2. Delete large source files:');
    console.log('      - src/data/NPWSFireHistory.shp');
    console.log('      - src/data/NPWSFireHistory.shx');
    console.log('      - src/data/NPWSFireHistory.dbf');
    console.log('      - src/data/NPWSFireHistory.prj');
    console.log('   3. Keep the data loader scripts but simplify them\n');

  } catch (error) {
    console.error('❌ Error generating static data:', error);
    process.exit(1);
  }
}

main();
