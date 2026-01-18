"use client";

import { User, MapPin, Languages, Sparkles, DollarSign, Calendar, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Step1Data } from "./Step1BasicInfo";
import type { Step2Data } from "./Step2LGBTQAlignment";
import type { Step3Data } from "./Step3ExperienceTags";
import type { Step4Data } from "./Step4Pricing";
import type { Step5Data } from "./Step5Availability";
import type { Step6Data } from "./Step6IDUpload";
import type { Database } from "@/types/database";

type City = Database["public"]["Tables"]["cities"]["Row"];

type Step7ReviewProps = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  cities: City[];
  onEdit: (step: number) => void;
};

const EXPERIENCE_LABELS: Record<string, string> = {
  daytime: "Daytime Explorer",
  nightlife: "Nightlife",
  food: "Food & Dining",
  "queer-history": "Queer History",
  "hidden-gems": "Hidden Gems",
};

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export function Step7Review({ step1, step2, step3, step4, step5, step6, cities, onEdit }: Step7ReviewProps) {
  const selectedCity = cities.find((c) => c.id === step1.cityId);
  const avatarUrl = step1.avatarUrl ?? null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-brand" />
          </div>
          <CardTitle className="text-3xl font-serif">Review Your Profile</CardTitle>
          <CardDescription className="text-base">
            Please review all your information before submitting. You can go back to edit any section.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={20} className="text-brand" />
              <CardTitle className="text-xl">Basic Information</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => onEdit(1)}
              className="text-sm text-brand hover:underline font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={step1.displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200"
              />
            )}
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-semibold text-slate-900">{step1.displayName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">City</p>
                <p className="font-semibold text-slate-900">
                  {selectedCity?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Languages</p>
                <p className="font-semibold text-slate-900">{step1.languages}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Bio</p>
            <p className="text-sm text-slate-700 leading-relaxed">{step1.shortBio}</p>
          </div>
        </CardContent>
      </Card>

      {/* LGBTQ+ Alignment */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-brand" />
              <CardTitle className="text-xl">LGBTQ+ Alignment</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => onEdit(2)}
              className="text-sm text-brand hover:underline font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {step2.identifiesAsLGBTQ && (
              <Badge variant="secondary" className="px-3 py-1">LGBTQ+ Community Member</Badge>
            )}
            {step2.allyCommitment && (
              <Badge variant="secondary" className="px-3 py-1">Committed Ally</Badge>
            )}
            {step2.safespaceAdvocate && (
              <Badge variant="secondary" className="px-3 py-1">Safe Space Advocate</Badge>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Why I guide LGBTQ+ travelers</p>
            <p className="text-sm text-slate-700 leading-relaxed">{step2.whyGuideQueer}</p>
          </div>
        </CardContent>
      </Card>

      {/* Experience Tags */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-brand" />
              <CardTitle className="text-xl">Experience Tags</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => onEdit(3)}
              className="text-sm text-brand hover:underline font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {step3.experienceTags.map((tag) => (
              <Badge key={tag} variant="outline" className="px-3 py-1.5">
                {EXPERIENCE_LABELS[tag] || tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-brand" />
              <CardTitle className="text-xl">Pricing</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => onEdit(4)}
              className="text-sm text-brand hover:underline font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-1">4 Hour</p>
              <p className="text-lg font-bold text-brand">
                {step4.currency === "USD" ? "$" : step4.currency}{step4.rate4h || "0"}
              </p>
            </div>
            <div className="p-4 bg-brand/5 rounded-xl border border-brand text-center">
              <p className="text-xs text-slate-500 mb-1">6 Hour</p>
              <p className="text-lg font-bold text-brand">
                {step4.currency === "USD" ? "$" : step4.currency}{step4.rate6h || "0"}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-1">8 Hour</p>
              <p className="text-lg font-bold text-brand">
                {step4.currency === "USD" ? "$" : step4.currency}{step4.rate8h || "0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-brand" />
              <CardTitle className="text-xl">Availability</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => onEdit(5)}
              className="text-sm text-brand hover:underline font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-2">Available Days</p>
            <div className="flex flex-wrap gap-2">
              {step5.availableDays.map((day) => (
                <Badge key={day} variant="secondary" className="px-3 py-1">
                  {DAY_LABELS[day] || day}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Typical Hours</p>
            <p className="text-sm font-semibold text-slate-900">
              {step5.startTime} - {step5.endTime}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ID Verification */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-brand" />
              <CardTitle className="text-xl">ID Verification</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => onEdit(6)}
              className="text-sm text-brand hover:underline font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-900">ID Document Uploaded</p>
              <p className="text-xs text-green-700">
                {step6.idDocumentType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3 text-center">
            <h3 className="text-lg font-semibold text-slate-900">Ready to Submit?</h3>
            <p className="text-sm text-slate-700 leading-relaxed max-w-xl mx-auto">
              Once you submit, our team will review your profile. This typically takes 1-3 business days.
              We&apos;ll email you once your profile is approved and you can start receiving bookings!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
