/**
 * Import cities to Supabase using API (batch insert)
 * Run: node import-cities.js
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CHUNK_SIZE = 1000; // 1000 records per batch
const INPUT_FILE = 'cities500.txt';

async function importCities() {
  console.log('🚀 Starting cities import...\n');
  
  // Read file
  console.log('📖 Reading cities500.txt...');
  const lines = fs.readFileSync(INPUT_FILE, 'utf8').split('\n');
  const totalLines = lines.length - 1;
  
  console.log(`📊 Total records: ${totalLines}`);
  console.log(`📦 Batch size: ${CHUNK_SIZE}`);
  console.log(`🔄 Total batches: ${Math.ceil(totalLines / CHUNK_SIZE)}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let startTime = Date.now();
  
  for (let i = 0; i < totalLines; i += CHUNK_SIZE) {
    const batchStart = i + 1;
    const batchEnd = Math.min(i + CHUNK_SIZE, totalLines);
    const batchLines = lines.slice(i, batchEnd);
    
    // Process batch
    const cities = [];
    for (const line of batchLines) {
      if (!line.trim()) continue;
      
      const fields = line.split('\t');
      if (fields.length < 19) continue;
      
      const [
        geonameid, name, asciiname, alternatenames,
        latitude, longitude, featureClass, featureCode,
        countryCode, cc2, admin1, admin2, admin3, admin4,
        population, elevation, dem, timezone, modDate
      ] = fields;
      
      cities.push({
        geonameid: parseInt(geonameid),
        name: name || '',
        asciiname: asciiname || '',
        alternatenames: alternatenames || '',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        feature_class: featureClass || '',
        feature_code: featureCode || '',
        country_code: countryCode || '',
        cc2: cc2 || '',
        admin1: admin1 || '',
        admin2: admin2 || '',
        admin3: admin3 || '',
        admin4: admin4 || '',
        population: population ? parseInt(population) : null,
        elevation: elevation ? parseInt(elevation) : null,
        dem: dem ? parseInt(dem) : null,
        timezone: timezone || '',
        modification_date: modDate || ''
      });
    }
    
    // Insert batch
    try {
      const { error } = await supabase
        .from('cities')
        .insert(cities);
      
      if (error) {
        console.error(`❌ Batch ${batchStart}-${batchEnd} failed:`, error.message);
        errorCount += cities.length;
      } else {
        console.log(`✓ Batch ${batchStart}-${batchEnd}: ${cities.length} records imported`);
        successCount += cities.length;
      }
      
      // Show progress
      const progress = ((batchEnd / totalLines) * 100).toFixed(2);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const speed = Math.round(successCount / elapsed);
      const remaining = Math.round((totalLines - batchEnd) / speed);
      
      process.stdout.write(`\r📊 Progress: ${progress}% | Imported: ${successCount} | Errors: ${errorCount} | Speed: ${speed}/s | ETA: ${remaining}s    `);
      
    } catch (error) {
      console.error(`\n❌ Batch ${batchStart}-${batchEnd} error:`, error.message);
      errorCount += cities.length;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n\n✅ Import completed!`);
  console.log(`📊 Total records: ${totalLines}`);
  console.log(`✓ Successfully imported: ${successCount}`);
  console.log(`✗ Failed: ${errorCount}`);
  console.log(`⏱️  Total time: ${elapsed}s`);
  console.log(`📈 Average speed: ${Math.round(successCount / elapsed)} records/s`);
}

// Run import
importCities().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
