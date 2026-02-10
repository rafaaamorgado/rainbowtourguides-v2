'use client';

import { Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { getCurrentUserId, uploadFile } from '@/lib/storage-helpers';

export type Step6Data = {
  idDocumentUrl: string | null;
  idDocumentType: string;
  proofOfAddressUrl: string | null;
};

type Step6IDUploadProps = {
  data: Step6Data;
  onChange: (data: Partial<Step6Data>) => void;
};

const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers-license', label: "Driver's License" },
  { value: 'national-id', label: 'National ID Card' },
  { value: 'government-id', label: 'Other Government-Issued ID' },
];

export function Step6IDUpload({ data, onChange }: Step6IDUploadProps) {
  const handleDocumentUpload = async (
    file: File,
    documentType: 'id-document' | 'proof-of-address',
  ) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to upload documents',
      };
    }

    return uploadFile(file, 'guide-documents', userId, documentType);
  };

  const handleIdDocumentUpload = (file: File) =>
    handleDocumentUpload(file, 'id-document');
  const handleProofOfAddressUpload = (file: File) =>
    handleDocumentUpload(file, 'proof-of-address');

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">ID Verification</CardTitle>
        <CardDescription>
          To ensure safety and trust, we need to verify your identity. Upload
          your government-issued ID and proof of address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* ID Type Selection */}
        <div className="space-y-2">
          <label
            htmlFor="idType"
            className="text-sm font-medium text-slate-700"
          >
            ID Document Type <span className="text-destructive">*</span>
          </label>
          <Select
            value={data.idDocumentType}
            onChange={(val) => onChange({ idDocumentType: val })}
            options={[{ value: '', label: 'Select ID type...' }, ...ID_TYPES]}
            placeholder="Select ID type..."
            className="h-11"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Upload ID Document <span className="text-destructive">*</span>
          </label>
          <PhotoUpload
            variant="document"
            size="xl"
            value={data.idDocumentUrl}
            onChange={(url) =>
              onChange({ idDocumentUrl: typeof url === 'string' ? url : null })
            }
            onUpload={handleIdDocumentUpload}
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            maxSizeMB={2}
            helperText="Supports JPG, PNG, PDF (Max 2MB)"
          />
        </div>

        {/* Proof of Address Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Proof of Address <span className="text-destructive">*</span>
          </label>
          <PhotoUpload
            variant="document"
            size="xl"
            value={data.proofOfAddressUrl}
            onChange={(url) =>
              onChange({
                proofOfAddressUrl: typeof url === 'string' ? url : null,
              })
            }
            onUpload={handleProofOfAddressUpload}
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            maxSizeMB={2}
            helperText="Supports JPG, PNG, PDF (Max 2MB)"
          />
        </div>

        {/* Security Info */}
        <div className="space-y-4 pt-4">
          <div className="flex gap-3 p-5 bg-blue-50 rounded-2xl border border-blue-200">
            <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 leading-relaxed">
              <p className="font-semibold mb-2">Why we need this:</p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Verify your identity to ensure traveler safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Maintain platform integrity and trust</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Comply with safety regulations</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-semibold">Privacy:</span> Your ID is
              encrypted, stored securely, and only accessible to our
              verification team. It will never be shared publicly or with
              travelers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
