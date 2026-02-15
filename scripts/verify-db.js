import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kpauppfsdtaoqolhmsbp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwYXVwcGZzZHRhb3FvbGhtc2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTczMTksImV4cCI6MjA4MzMzMzMxOX0.tgAS8-lNY4WG6OSZ4r_wEf4-Vw9Qvj7NkbnlMk6f8Uc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation')) {
        return false;
      }
      throw error;
    }
    return true;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error.message);
    return false;
  }
}

// Function to check if a function exists
async function checkFunctionExists(functionName) {
  try {
    const { data, error } = await supabase
      .rpc(functionName, { username: 'test' })
      .limit(1);

    if (error) {
      if (error.message.includes('function')) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error(`Error checking function ${functionName}:`, error.message);
    return false;
  }
}

// Main verification function
async function verifyDatabase() {
  console.log('🔍 Verifying Wocon Database Structure...');
  console.log('============================================');

  // Check core tables
  const tables = [
    'profiles',
    'trips',
    'cities',
    'trip_members',
    'trip_items',
    'comments',
    'trip_likes',
    'friendships'
  ];

  console.log('\n📋 Checking Core Tables:');
  for (const table of tables) {
    const exists = await checkTableExists(table);
    console.log(`${exists ? '✅' : '❌'} ${table}`);
  }

  // Check RPC functions
  const functions = [
    'get_profile_by_username',
    'discover_city'
  ];

  console.log('\n🔧 Checking RPC Functions:');
  for (const func of functions) {
    const exists = await checkFunctionExists(func);
    console.log(`${exists ? '✅' : '❌'} ${func}`);
  }

  // Check discover functionality
  console.log('\n🌍 Testing Discover Functionality:');
  try {
    const { data, error } = await supabase.rpc('discover_city');
    if (error) {
      console.log('❌ Discover function failed:', error.message);
    } else {
      console.log('✅ Discover function works!');
      if (data && data.length > 0) {
        const city = data[0];
        console.log(`   Found city: ${city.name}, ${city.country_code}`);
        console.log(`   Coordinates: ${city.latitude}, ${city.longitude}`);
      }
    }
  } catch (error) {
    console.log('❌ Discover function error:', error.message);
  }

  console.log('\n============================================');
  console.log('📊 Database Verification Complete!');
}

// Run verification
verifyDatabase().catch(console.error);
