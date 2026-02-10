'use client';

import { UseFormReturn } from 'react-hook-form';
import { GuideOnboardingData } from '@/lib/validations/guide-onboarding';
import { Input } from '@/components/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Phone, Instagram, Facebook, MessageCircle } from 'lucide-react';

interface StepSocialsProps {
  form: UseFormReturn<GuideOnboardingData>;
}

export function StepSocials({ form }: StepSocialsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Contact & Socials</h2>
        <p className="text-sm text-muted-foreground">
          Help us verify your identity and stay in touch. Only your phone number
          and WhatsApp are required. Other social links help build trust with
          travelers.
        </p>
      </div>

      {/* Phone number — required */}
      <FormField
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="+1 555 123 4567"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              Include country code. Used for verification only — never shared
              with travelers.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-ink-soft">
            Other social profiles (optional)
          </span>
        </div>
      </div>

      {/* Social fields — WhatsApp required, others optional */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="social_instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="@yourhandle"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="facebook.com/yourprofile"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {/* X/Twitter icon approximated with a simple label */}
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X / Twitter
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="@yourhandle"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 555 123 4567"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_telegram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Telegram
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="@yourhandle"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_zalo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Zalo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Your Zalo ID"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
