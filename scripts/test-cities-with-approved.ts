/**
 * Test cities query with approved field
 * Run with: export $(cat .env.local | xargs) && npx tsx scripts/test-cities-with-approved.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCitiesQuery() {
  console.log('🔍 Testing cities query with approved field...\n');

  const { data: cities, error } = await supabase
    .from('cities')
    .select(
      `
      id,
      name,
      slug,
      hero_image_url,
      country_id,
      country:countries!cities_country_id_fkey(
        id,
        name,
        iso_code
      ),
      guides:guides!guides_city_id_fkey(
        id,
        status,
        approved
      )
    `,
    )
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Retrieved ${cities?.length || 0} cities\n`);

  const summary: any[] = [];

  cities?.forEach((city: any) => {
    const allGuides = city.guides || [];
    const approvedGuides = allGuides.filter((g: any) => 
      g.status === 'approved' || g.approved === true
    );

    console.log(`📍 ${city.name} (${city.country?.name || 'Unknown'})`);
    console.log(`   Total guides from DB: ${allGuides.length}`);
    console.log(`   Approved guides: ${approvedGuides.length}`);
    if (allGuides.length > 0) {
      console.log(`   Guide details:`, allGuides.map((g: any) => ({
        id: g.id.substring(0, 8),
        status: g.status,
        approved: g.approved
      })));
    }
    console.log('');

    summary.push({
      city_name: city.name,
      country_name: city.country?.name || 'Unknown',
      total_guides: allGuides.length,
      approved_guides: approvedGuides.length,
    });
  });

  console.log('\n📊 Summary:');
  console.table(summary);

  const citiesWithGuides = summary.filter(c => c.approved_guides > 0);
  console.log(`\n✅ Cities with approved guides: ${citiesWithGuides.length} / ${summary.length}`);
}

testCitiesQuery().catch(console.error);
