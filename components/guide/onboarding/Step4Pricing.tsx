'use client';

import { DollarSign, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export type Step4Data = {
  rate4h: string;
  rate6h: string;
  rate8h: string;
  currency: string;
};

type Step4PricingProps = {
  data: Step4Data;
  onChange: (data: Partial<Step4Data>) => void;
};

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

export function Step4Pricing({ data, onChange }: Step4PricingProps) {
  const calculateHourlyRate = (totalRate: string, hours: number): string => {
    const rate = parseFloat(totalRate);
    if (isNaN(rate) || rate === 0) return '0';
    return (rate / hours).toFixed(2);
  };

  const selectedCurrency = CURRENCY_OPTIONS.find(
    (c) => c.value === data.currency,
  );
  const currencySymbol = selectedCurrency?.symbol || '$';

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">Pricing</CardTitle>
        <CardDescription>
          Set your rates for different tour durations. You can always adjust
          these later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Selection */}
        <div className="space-y-2">
          <label
            htmlFor="currency"
            className="text-sm font-medium text-slate-700"
          >
            Currency <span className="text-destructive">*</span>
          </label>
          <Select
            value={data.currency}
            onChange={(val) => onChange({ currency: val })}
            options={CURRENCY_OPTIONS}
            placeholder="Select currency"
            className="h-11"
          />
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-4">
          {/* 4 Hour Rate */}
          <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign size={24} className="text-brand" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    4 Hour Experience
                  </h3>
                  <p className="text-sm text-slate-600">Half-day tour</p>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="rate4h"
                    className="text-sm font-medium text-slate-700"
                  >
                    Total Rate <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      {currencySymbol}
                    </span>
                    <Input
                      id="rate4h"
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.rate4h}
                      onChange={(e) => onChange({ rate4h: e.target.value })}
                      placeholder="0.00"
                      required
                      className="pl-8"
                    />
                  </div>
                  {data.rate4h && parseFloat(data.rate4h) > 0 && (
                    <p className="text-xs text-slate-500">
                      ≈ {currencySymbol}
                      {calculateHourlyRate(data.rate4h, 4)}/hour
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 6 Hour Rate */}
          <div className="p-6 bg-brand/5 rounded-2xl border-2 border-brand">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign size={24} className="text-brand" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      6 Hour Experience
                    </h3>
                    <p className="text-sm text-slate-600">
                      Full-day tour (Most Popular)
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-brand text-white text-xs font-bold rounded-full uppercase">
                    Popular
                  </span>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="rate6h"
                    className="text-sm font-medium text-slate-700"
                  >
                    Total Rate <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      {currencySymbol}
                    </span>
                    <Input
                      id="rate6h"
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.rate6h}
                      onChange={(e) => onChange({ rate6h: e.target.value })}
                      placeholder="0.00"
                      required
                      className="pl-8"
                    />
                  </div>
                  {data.rate6h && parseFloat(data.rate6h) > 0 && (
                    <p className="text-xs text-slate-500">
                      ≈ {currencySymbol}
                      {calculateHourlyRate(data.rate6h, 6)}/hour
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 8 Hour Rate */}
          <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign size={24} className="text-brand" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    8 Hour Experience
                  </h3>
                  <p className="text-sm text-slate-600">Extended day tour</p>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="rate8h"
                    className="text-sm font-medium text-slate-700"
                  >
                    Total Rate <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      {currencySymbol}
                    </span>
                    <Input
                      id="rate8h"
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.rate8h}
                      onChange={(e) => onChange({ rate8h: e.target.value })}
                      placeholder="0.00"
                      required
                      className="pl-8"
                    />
                  </div>
                  {data.rate8h && parseFloat(data.rate8h) > 0 && (
                    <p className="text-xs text-slate-500">
                      ≈ {currencySymbol}
                      {calculateHourlyRate(data.rate8h, 8)}/hour
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tips */}
        <div className="flex gap-3 p-5 bg-blue-50 rounded-2xl border border-blue-200">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 leading-relaxed">
            <p className="font-semibold mb-1">Pricing Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Research average rates in your city</li>
              <li>Consider your experience level and unique expertise</li>
              <li>Longer tours can have a lower hourly rate</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
