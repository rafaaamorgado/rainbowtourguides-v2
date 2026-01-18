/**
 * Test script to debug cities query
 * Run with: npx tsx scripts/test-cities-query.ts
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
  console.log('🔍 Testing cities query...\n');

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
        status
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

  cities?.forEach((city: any) => {
    const allGuides = city.guides || [];
    const approvedGuides = allGuides.filter((g: any) => g.status === 'approved');

    console.log(`📍 ${city.name} (${city.country?.name || 'Unknown'})`);
    console.log(`   Total guides from DB: ${allGuides.length}`);
    console.log(`   Approved guides: ${approvedGuides.length}`);
    if (allGuides.length > 0) {
      console.log(`   Guide statuses:`, allGuides.map((g: any) => g.status));
    }
    console.log('');
  });

  // Summary
  const summary = cities?.map((city: any) => ({
    city_name: city.name,
    country_name: city.country?.name || 'Unknown',
    guides_count: (city.guides || []).filter((g: any) => g.status === 'approved').length,
  }));

  console.log('\n📊 Summary:');
  console.table(summary);
}

testCitiesQuery().catch(console.error);
