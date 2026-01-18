import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { ensureCityHeroImage } from "@/lib/images/city-hero";

export async function POST(req: Request) {
  try {
    const { guideId, status } = await req.json();
    if (!guideId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin() as any;

    const { data, error } = await supabase
      .from("guides")
      .update({ status })
      .eq("id", guideId)
      .select("city_id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fire-and-forget hero image generation; don't block approval
    if (status === "approved" && data?.city_id) {
      ensureCityHeroImage(data.city_id).catch((err) => {
        console.error("ensureCityHeroImage failed", err);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}

