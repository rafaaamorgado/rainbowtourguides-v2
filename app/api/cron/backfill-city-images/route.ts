import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { ensureCityHeroImage } from "@/lib/images/city-hero";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin() as any;

  const { data, error } = await supabase
    .from("cities_with_approved_guides")
    .select("city_id")
    .gt("approved_guide_count", 0)
    .is("hero_image_url", null)
    .eq("country_is_supported", true)
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cityIds = (data || []).map((row: any) => row.city_id).filter(Boolean);
  let succeeded = 0;
  let failed = 0;

  for (const cityId of cityIds) {
    try {
      await ensureCityHeroImage(cityId);
      succeeded += 1;
    } catch (err) {
      console.error("ensureCityHeroImage failed", err);
      failed += 1;
    }
  }

  return NextResponse.json({
    processed: cityIds.length,
    succeeded,
    failed,
  });
}

