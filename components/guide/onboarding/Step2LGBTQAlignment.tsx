"use client";

import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export type Step2Data = {
  identifiesAsLGBTQ: boolean;
  allyCommitment: boolean;
  safespaceAdvocate: boolean;
  whyGuideQueer: string;
};

type Step2LGBTQAlignmentProps = {
  data: Step2Data;
  onChange: (data: Partial<Step2Data>) => void;
};

const ALIGNMENT_OPTIONS = [
  {
    key: "identifiesAsLGBTQ" as keyof Step2Data,
    label: "I identify as part of the LGBTQ+ community",
    description: "You personally identify as lesbian, gay, bisexual, transgender, queer, or another identity within the community.",
  },
  {
    key: "allyCommitment" as keyof Step2Data,
    label: "I'm a committed ally to the LGBTQ+ community",
    description: "You actively support and advocate for LGBTQ+ rights and inclusion.",
  },
  {
    key: "safespaceAdvocate" as keyof Step2Data,
    label: "I'm dedicated to creating safe, welcoming spaces",
    description: "You prioritize safety, respect, and authentic experiences for LGBTQ+ travelers.",
  },
];

export function Step2LGBTQAlignment({ data, onChange }: Step2LGBTQAlignmentProps) {
  const toggleOption = (key: keyof Step2Data) => {
    onChange({ [key]: !data[key] });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">LGBTQ+ Alignment</CardTitle>
        <CardDescription>
          Help us understand your connection to and commitment to the LGBTQ+ community. Select all that apply.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alignment Checkboxes */}
        <div className="space-y-3">
          {ALIGNMENT_OPTIONS.map((option) => {
            const isSelected = data[option.key] as boolean;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => toggleOption(option.key)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "border-brand bg-brand/5"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-brand border-brand"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-slate-900">{option.label}</p>
                    <p className="text-sm text-slate-600 font-light leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Why Guide Queer Travelers */}
        <div className="space-y-2 pt-4">
          <label htmlFor="whyGuideQueer" className="text-sm font-medium text-slate-700">
            Why do you enjoy guiding LGBTQ+ travelers? <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="whyGuideQueer"
            value={data.whyGuideQueer}
            onChange={(e) => onChange({ whyGuideQueer: e.target.value })}
            placeholder="Share what motivates you to guide LGBTQ+ travelers and what makes you passionate about creating safe, authentic experiences..."
            rows={5}
            maxLength={1000}
            required
            className="resize-none"
          />
          <p className="text-xs text-slate-500">
            {data.whyGuideQueer.length}/1000 characters • This helps travelers understand your perspective and commitment.
          </p>
        </div>

        {/* Info Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold">Why we ask:</span> Rainbow Tour Guides is built on trust, safety, and authentic connection. Understanding your relationship with the LGBTQ+ community helps us ensure every traveler has a meaningful, respectful experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
