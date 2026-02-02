'use client';

import { UseFormReturn } from 'react-hook-form';
import { GuideOnboardingData } from '@/lib/validations/guide-onboarding';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface StepRatesProps {
  form: UseFormReturn<GuideOnboardingData>;
}

export function StepRates({ form }: StepRatesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Pricing</h2>
        <p className="text-sm text-muted-foreground">
          Set your base rates for private tour durations. This is the total
          price for the tour (not per person).
        </p>
      </div>

      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'VND', label: 'VND (₫)' },
                  { value: 'THB', label: 'THB (฿)' },
                ]}
                placeholder="Select currency"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="base_price_4h"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4 Hours (Half Day)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="base_price_6h"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>6 Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="base_price_8h"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>8 Hours (Full Day)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
