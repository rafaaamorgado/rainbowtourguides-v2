"use client";

import { Sun, Moon, Utensils, Landmark, Sparkles, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export type Step3Data = {
  experienceTags: string[];
};

type Step3ExperienceTagsProps = {
  data: Step3Data;
  onChange: (data: Partial<Step3Data>) => void;
};

const EXPERIENCE_OPTIONS = [
  {
    value: "daytime",
    label: "Daytime Explorer",
    description: "Museums, galleries, landmarks, walking tours",
    icon: Sun,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    value: "nightlife",
    label: "Nightlife",
    description: "Bars, clubs, drag shows, LGBTQ+ venues",
    icon: Moon,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    value: "food",
    label: "Food & Dining",
    description: "Restaurants, street food, culinary experiences",
    icon: Utensils,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  {
    value: "queer-history",
    label: "Queer History",
    description: "LGBTQ+ historical sites, activism, culture",
    icon: Landmark,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    value: "hidden-gems",
    label: "Hidden Gems",
    description: "Off-the-beaten-path spots, local secrets",
    icon: Sparkles,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

export function Step3ExperienceTags({ data, onChange }: Step3ExperienceTagsProps) {
  const toggleTag = (tag: string) => {
    const newTags = data.experienceTags.includes(tag)
      ? data.experienceTags.filter((t) => t !== tag)
      : [...data.experienceTags, tag];
    onChange({ experienceTags: newTags });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">Experience Tags</CardTitle>
        <CardDescription>
          What kinds of experiences do you specialize in? Select all that describe your tours. You need at least one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {EXPERIENCE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = data.experienceTags.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleTag(option.value)}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? `${option.borderColor} ${option.bgColor} shadow-md`
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? option.bgColor : "bg-slate-50"
                    }`}
                  >
                    <Icon size={28} className={isSelected ? option.color : "text-slate-400"} />
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-slate-900 mb-1 text-lg">{option.label}</h3>
                    <p className="text-sm text-slate-600 font-light leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-brand border-brand"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selection Counter */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <p className="text-sm text-slate-700">
            {data.experienceTags.length > 0 ? (
              <>
                <span className="font-bold text-brand">{data.experienceTags.length}</span> experience
                {data.experienceTags.length !== 1 ? "s" : ""} selected
              </>
            ) : (
              <span className="text-slate-500">Select at least one experience type to continue</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
