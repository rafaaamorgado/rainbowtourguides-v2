/**
 * Script to approve all pending guides
 * Run with: npx tsx scripts/approve-guides.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function approveAllGuides() {
  console.log('🔄 Approving all pending guides...\n');

  // First, get all pending guides (without joins to avoid RLS issues)
  const { data: pendingGuides, error: fetchError } = await supabase
    .from('guides')
    .select('id, status, city_id')
    .eq('status', 'pending');

  if (fetchError) {
    console.error('❌ Error fetching guides:', fetchError);
    return;
  }

  if (!pendingGuides || pendingGuides.length === 0) {
    console.log('✅ No pending guides to approve');
    return;
  }

  console.log(`📋 Found ${pendingGuides.length} pending guides`);

  console.log('\n🔄 Updating status to "approved"...\n');

  // Update all pending guides to approved
  const { data: updatedGuides, error: updateError } = await supabase
    .from('guides')
    .update({ status: 'approved' })
    .eq('status', 'pending')
    .select();

  if (updateError) {
    console.error('❌ Error updating guides:', updateError);
    return;
  }

  console.log(`✅ Successfully approved ${updatedGuides?.length || 0} guides!\n`);

  // Verify the update
  const { data: verifyGuides, error: verifyError } = await supabase
    .from('guides')
    .select('id, status')
    .order('status');

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
    return;
  }

  console.log('\n📊 Current guide statuses:');
  const statusCounts = verifyGuides?.reduce((acc: any, guide: any) => {
    acc[guide.status] = (acc[guide.status] || 0) + 1;
    return acc;
  }, {});

  console.table(statusCounts);
  
  console.log('\n✨ Done! Guides are now approved and should appear on the cities page.');
}

approveAllGuides().catch(console.error);
