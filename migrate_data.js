import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function migrate() {
  console.log('🚀 Starting migration...');

  // 1. Load index.json
  const indexPath = path.join(__dirname, 'public/data/index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('index.json not found at', indexPath);
    return;
  }
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  for (const entry of indexData.countries) {
    console.log(`\n🌍 Processing ${entry.country}...`);

    // 2. Upsert Country
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .upsert({
        name: entry.country,
        code: entry.countryCode,
        region: entry.region,
        flag: entry.flag,
        coordinates: entry.coordinates
      }, { onConflict: 'code' })
      .select()
      .single();

    if (countryError) {
      console.error(`Error upserting country ${entry.country}:`, countryError.message);
      continue;
    }

    // 3. Load Country Detail JSON
    const detailPath = path.join(__dirname, 'public/data', entry.dataFile);
    if (!fs.existsSync(detailPath)) {
      console.warn(`Detail file ${entry.dataFile} not found. Skipping policies.`);
      continue;
    }

    const detailData = JSON.parse(fs.readFileSync(detailPath, 'utf8'));
    
    if (detailData.policies && detailData.policies.length > 0) {
      const policiesToInsert = detailData.policies.map(p => ({
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

      const { error: policyError } = await supabase
        .from('policies')
        .upsert(policiesToInsert, { onConflict: 'id' });

      if (policyError) {
        console.error(`Error inserting policies for ${entry.country}:`, policyError.message);
      } else {
        console.log(`✅ Successfully migrated ${policiesToInsert.length} policies for ${entry.country}.`);
      }
    }
  }

  console.log('\n✨ Migration completed!');
}

migrate();
