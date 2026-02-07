'use client';

import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { GuideOnboardingData } from '@/lib/validations/guide-onboarding';
import { uploadAvatar, getCurrentUserId } from '@/lib/storage-helpers';

export function useStepBasicInfo(form: UseFormReturn<GuideOnboardingData>) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleAvatarUpload = useCallback(async (file: File) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to upload photos',
      };
    }
    return uploadAvatar(userId, file);
  }, []);

  return {
    avatarUrl,
    setAvatarUrl,
    handleAvatarUpload,
  };
}
