import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sync() {
  console.log('🚀 AirLens Sync Engine v1.1 Starting...');
  const stats = { countries: 0, policies: 0, errors: 0, skipped: 0 };

  const dataDir = path.join(process.cwd(), 'public/data');
  const indexPath = path.join(dataDir, 'index.json');

  if (!fs.existsSync(indexPath)) {
    console.error(`❌ index.json not found at ${indexPath}`);
    process.exit(1);
  }

  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  for (const entry of indexData.countries) {
    try {
      console.log(`\n🌍 Processing: ${entry.country} [${entry.countryCode}]`);

      // 1. Data Validation
      if (!entry.countryCode || !entry.coordinates) {
        console.warn(`⚠️ Invalid entry for ${entry.country}. Skipping.`);
        stats.skipped++;
        continue;
      }

      // 2. Upsert Country
      const { error: countryError } = await supabase
        .from('countries')
        .upsert({
          name: entry.country,
          code: entry.countryCode,
          region: entry.region,
          flag: entry.flag,
          coordinates: entry.coordinates,
          updated_at: new Date().toISOString()
        }, { onConflict: 'code' });

      if (countryError) throw new Error(`Country sync failed: ${countryError.message}`);
      stats.countries++;

      // 3. Sync Policies
      const detailPath = path.join(dataDir, entry.dataFile);
      if (fs.existsSync(detailPath)) {
        const detailData = JSON.parse(fs.readFileSync(detailPath, 'utf8'));
        
        if (detailData.policies && Array.isArray(detailData.policies)) {
          const policiesToInsert = detailData.policies
            .filter(p => p.id && p.name) // Basic validation
            .map(p => ({
              id: p.id,
              country_code: entry.countryCode,
              name: p.name,
              implementation_date: p.implementationDate,
              type: p.type,
              url: p.url,
              description: p.description,
              target_pollutants: p.targetPollutants,
              measures: p.measures,
              impact: p.impact,
              timeline: p.timeline
            }));

          if (policiesToInsert.length > 0) {
            const { error: policyError } = await supabase
              .from('policies')
              .upsert(policiesToInsert, { onConflict: 'id' });

            if (policyError) {
              console.error(`❌ Policy sync error: ${policyError.message}`);
              stats.errors++;
            } else {
              console.log(`✅ Synced ${policiesToInsert.length} policies.`);
              stats.policies += policiesToInsert.length;
            }
          }
        }
      } else {
        console.warn(`💡 No detail file found for ${entry.countryCode}`);
      }
    } catch (err) {
      console.error(`❌ Error syncing ${entry.country}:`, err instanceof Error ? err.message : String(err));
      stats.errors++;
    }
  }

  console.log('\n' + '='.repeat(40));
  console.log('✨ SYNCHRONIZATION SUMMARY v1.1');
  console.log('='.repeat(40));
  console.log(`✅ Countries Synced:  ${stats.countries}`);
  console.log(`✅ Policies Synced:   ${stats.policies}`);
  console.log(`⚠️ Entries Skipped:  ${stats.skipped}`);
  console.log(`❌ Errors Encountered: ${stats.errors}`);
  console.log('='.repeat(40));
  console.log('🚀 System ready for Atmospheric Decoded v1.1.0');
}

sync();
