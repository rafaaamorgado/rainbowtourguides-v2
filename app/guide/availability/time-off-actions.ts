"use server";

import { revalidatePath } from "next/cache";
import {
  createGuideTimeOff,
  deleteGuideTimeOff,
  updateGuideTimeOff,
} from "@/lib/guide-time-off";

export async function createTimeOffAction(input: {
  title: string;
  starts_at: string;
  ends_at: string;
  note?: string;
}) {
  const { success, error } = await createGuideTimeOff({
    title: input.title,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    note: input.note ?? null,
  });

  if (!success) {
    return { success, error };
  }

  revalidatePath("/guide/availability");
  return { success: true };
}

export async function updateTimeOffAction(
  id: string,
  input: {
    title?: string;
    starts_at?: string;
    ends_at?: string;
    note?: string;
  }
) {
  const { success, error } = await updateGuideTimeOff(id, input);
  if (!success) {
    return { success, error };
  }
  revalidatePath("/guide/availability");
  return { success: true };
}

export async function deleteTimeOffAction(id: string) {
  const { success, error } = await deleteGuideTimeOff(id);
  if (!success) {
    return { success, error };
  }
  revalidatePath("/guide/availability");
  return { success: true };
}
