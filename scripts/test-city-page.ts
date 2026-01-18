/**
 * Test city page data fetching
 * Run with: export $(cat .env.local | xargs) && npx tsx scripts/test-city-page.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCityPage(citySlug: string) {
  console.log(`🔍 Testing city page for: ${citySlug}\n`);

  // 1. Get city data
  const { data: city, error: cityError } = await supabase
    .from('cities')
    .select(`
      *,
      country:countries!cities_country_id_fkey(*)
    `)
    .eq('slug', citySlug)
    .eq('is_active', true)
    .single();

  if (cityError || !city) {
    console.error('❌ City not found:', cityError);
    return;
  }

  console.log(`✅ City found: ${city.name} (${city.country?.name})`);

  // 2. Get guide count
  const { count } = await supabase
    .from('guides')
    .select('*', { count: 'exact', head: true })
    .eq('city_id', city.id)
    .or('status.eq.approved,approved.eq.true');

  console.log(`📊 Approved guides: ${count || 0}\n`);

  // 3. Get guides for this city (without join to avoid RLS issues)
  const { data: guides, error: guidesError } = await supabase
    .from('guides')
    .select(`
      id,
      slug,
      city_id,
      headline,
      tagline,
      bio,
      experience_tags,
      price_4h,
      price_6h,
      price_8h,
      currency,
      status,
      approved
    `)
    .eq('city_id', city.id)
    .or('status.eq.approved,approved.eq.true');

  if (guidesError) {
    console.error('❌ Error fetching guides:', guidesError);
    return;
  }

  console.log(`✅ Found ${guides?.length || 0} guides:\n`);
  
  guides?.forEach((guide: any) => {
    console.log(`   📍 Guide ${guide.id.substring(0, 8)}`);
    console.log(`      Headline: ${guide.headline || 'No headline'}`);
    console.log(`      Price 4h: ${guide.price_4h || 'N/A'} ${guide.currency || ''}`);
    console.log(`      Status: ${guide.status || 'null'} | Approved: ${guide.approved}`);
    console.log('');
  });

  console.log('\n✨ City page should work correctly!');
}

// Test with Berlin
const testSlug = process.argv[2] || 'berlin';
testCityPage(testSlug).catch(console.error);
