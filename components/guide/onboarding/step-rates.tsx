'use client';

import { useEffect } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';

interface StepRatesProps {
  form: UseFormReturn<GuideOnboardingData>;
}

export function StepRates({ form }: StepRatesProps) {
  useEffect(() => {
    if (form.getValues('currency') !== 'USD') {
      form.setValue('currency', 'USD');
    }
  }, [form]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Pricing</h2>
        <p className="text-sm text-muted-foreground">
          Set your base rates for private tour durations. This is the total
          price for the tour (not per person).
        </p>
      </div>

      <div className="space-y-2">
        <FormLabel>Currency</FormLabel>
        <Input value="Currency: USD ($)" readOnly className="bg-muted/40" />
        <p className="text-xs text-muted-foreground">
          All tours are priced and paid in USD.
        </p>
      </div>

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
