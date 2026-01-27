/**
 * Split cities500.txt into smaller chunks and generate SQL insert files
 * Run: node split-cities.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'cities500.txt';
const CHUNK_SIZE = 10000; // 10,000 records per chunk
const OUTPUT_DIR = 'cities_chunks';

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Read file line by line
const lines = fs.readFileSync(INPUT_FILE, 'utf8').split('\n');
const totalLines = lines.length - 1; // Last line might be empty
const totalChunks = Math.ceil(totalLines / CHUNK_SIZE);

console.log(`Total records: ${totalLines}`);
console.log(`Chunk size: ${CHUNK_SIZE}`);
console.log(`Total chunks: ${totalChunks}`);
console.log('Processing...\n');

for (let i = 0; i < totalChunks; i++) {
  const start = i * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, totalLines);
  const chunkLines = lines.slice(start, end);
  
  // Generate SQL file
  let sql = `-- Cities chunk ${i + 1}/${totalChunks}\n`;
  sql += `-- Records: ${start + 1} to ${end}\n\n`;
  
  for (const line of chunkLines) {
    if (!line.trim()) continue;
    
    const fields = line.split('\t');
    if (fields.length < 19) continue;
    
    const [
      geonameid, name, asciiname, alternatenames,
      latitude, longitude, featureClass, featureCode,
      countryCode, cc2, admin1, admin2, admin3, admin4,
      population, elevation, dem, timezone, modDate
    ] = fields;
    
    // Escape single quotes in text fields
    const escape = (str) => str ? str.replace(/'/g, "''") : '';
    
    sql += `INSERT INTO public.cities (geonameid, name, asciiname, alternatenames, latitude, longitude, feature_class, feature_code, country_code, cc2, admin1, admin2, admin3, admin4, population, elevation, dem, timezone, modification_date) VALUES (${geonameid}, '${escape(name)}', '${escape(asciiname)}', '${escape(alternatenames)}', ${latitude}, ${longitude}, '${featureClass}', '${featureCode}', '${countryCode}', '${cc2}', '${escape(admin1)}', '${escape(admin2)}', '${escape(admin3)}', '${escape(admin4)}', ${population || 'NULL'}, ${elevation || 'NULL'}, ${dem || 'NULL'}, '${escape(timezone)}', '${escape(modDate)}');\n`;
  }
  
  const chunkFile = path.join(OUTPUT_DIR, `chunk_${i + 1}.sql`);
  fs.writeFileSync(chunkFile, sql, 'utf8');
  
  console.log(`✓ Generated chunk ${i + 1}/${totalChunks}: ${chunkFile} (${chunkLines.length} records)`);
}

console.log('\n✅ All chunks generated!');
console.log(`📁 Output directory: ${OUTPUT_DIR}`);
console.log('\nNext steps:');
console.log('1. Upload SQL files to Supabase:');
console.log('   - Use Supabase SQL Editor to run each chunk file');
console.log('   - Start from chunk_1.sql and run sequentially');
console.log('2. Or use psql command:');
console.log('   psql -h db.xxx.supabase.co -U postgres -d postgres -f cities_chunks/chunk_1.sql');
