'use client';

import { UseFormReturn } from 'react-hook-form';
import { GuideOnboardingData } from '@/lib/validations/guide-onboarding';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { uploadVerificationDoc } from '@/lib/cloudinary';
import { Shield, Lock } from 'lucide-react';

interface StepVerificationDocsProps {
  form: UseFormReturn<GuideOnboardingData>;
}

export function StepVerificationDocs({ form }: StepVerificationDocsProps) {
  const idDocumentUrl = form.watch('id_document_url');
  const proofOfAddressUrl = form.watch('proof_of_address_url');

  const handleUpload = async (
    file: File,
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    const result = await uploadVerificationDoc(file);
    if (result.success) {
      return { success: true, url: result.secure_url };
    }
    return { success: false, error: result.error };
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Verification Documents</h2>
        <p className="text-sm text-muted-foreground">
          To keep the community safe, we manually verify every guide. Please
          upload the documents below.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900">
            Your privacy is protected
          </p>
          <p className="text-sm text-blue-800">
            Documents are encrypted, stored securely, and only reviewed by our
            admin team. They are never shown to travelers.
          </p>
        </div>
      </div>

      {/* Requirements */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">Requirements:</p>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>
            <span className="font-medium">Clear photo</span> of Passport,
            Driver&apos;s License, or National ID.
          </li>
          <li>
            <span className="font-medium">Legible text</span>, no glare, and{' '}
            <span className="font-medium">all 4 edges</span> visible.
          </li>
          <li>
            <span className="font-medium">No edits</span> or filters.
          </li>
          <li>
            <span className="font-medium">Max file size: 2MB</span>.
          </li>
        </ul>
      </div>

      {/* Government ID */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-ink-soft" />
          <label className="text-sm font-semibold text-ink">
            Government-Issued ID <span className="text-red-500">*</span>
          </label>
        </div>
        <p className="text-xs text-ink-soft">
          Upload a clear photo of your passport, driver&apos;s license, or
          national ID card. All details must be legible and the document must not
          be expired.
        </p>
        <PhotoUpload
          variant="document"
          size="lg"
          value={idDocumentUrl || null}
          onChange={(url) => {
            form.setValue(
              'id_document_url',
              typeof url === 'string' ? url : '',
              { shouldValidate: true },
            );
          }}
          onUpload={handleUpload}
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          maxSizeMB={2}
          helperText="Supports JPG, PNG, PDF (Max 2MB)"
        />
        {form.formState.errors.id_document_url && (
          <p className="text-sm text-red-600">
            {form.formState.errors.id_document_url.message}
          </p>
        )}
      </div>

      {/* Proof of Address */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-ink-soft" />
          <label className="text-sm font-semibold text-ink">
            Proof of Address <span className="text-red-500">*</span>
          </label>
        </div>
        <p className="text-xs text-ink-soft">
          A utility bill, bank statement, or official letter from the last 3
          months showing your name and address.
        </p>
        <PhotoUpload
          variant="document"
          size="lg"
          value={proofOfAddressUrl || null}
          onChange={(url) => {
            form.setValue(
              'proof_of_address_url',
              typeof url === 'string' ? url : '',
              { shouldValidate: true },
            );
          }}
          onUpload={handleUpload}
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          maxSizeMB={2}
          helperText="Supports JPG, PNG, PDF (Max 2MB)"
        />
        {form.formState.errors.proof_of_address_url && (
          <p className="text-sm text-red-600">
            {form.formState.errors.proof_of_address_url.message}
          </p>
        )}
      </div>
    </div>
  );
}
