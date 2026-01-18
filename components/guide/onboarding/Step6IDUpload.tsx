'use client';

import { useState } from 'react';
import {
  Upload,
  X,
  Shield,
  FileText,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { getCurrentUserId, uploadFile } from '@/lib/storage-helpers';

export type Step6Data = {
  idDocumentUrl: string | null;
  idDocumentType: string;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get current user ID for folder path
      const userId = await getCurrentUserId();
      if (!userId) {
        setUploadError('You must be logged in to upload documents');
        setIsUploading(false);
        return;
      }

      // Upload to Supabase Storage (private bucket)
      const result = await uploadFile(
        file,
        'guide-documents',
        userId,
        'id-document',
      );

      if (result.success && result.url) {
        onChange({ idDocumentUrl: result.url });
      } else {
        setUploadError(result.error || 'Failed to upload document');
      }
    } catch (error) {
      setUploadError('An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">ID Verification</CardTitle>
        <CardDescription>
          To ensure safety and trust, we need to verify your identity. Upload a
          government-issued ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ID Type Selection */}
        <div className="space-y-2">
          <label
            htmlFor="idType"
            className="text-sm font-medium text-slate-700"
          >
            ID Document Type <span className="text-destructive">*</span>
          </label>
          <select
            id="idType"
            value={data.idDocumentType}
            onChange={(e) => onChange({ idDocumentType: e.target.value })}
            required
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <option value="">Select ID type...</option>
            {ID_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">
            Upload ID Document <span className="text-destructive">*</span>
          </label>

          {isUploading ? (
            <div className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-brand rounded-2xl bg-brand/5">
              <Loader2 size={48} className="text-brand animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700">
                Uploading document securely...
              </p>
              <p className="text-xs text-slate-500 mt-2">
                This may take a moment
              </p>
            </div>
          ) : data.idDocumentUrl ? (
            <div className="space-y-3">
              {/* Success State */}
              <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">
                      ID Document Uploaded
                    </h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      Your ID has been uploaded successfully. Our team will
                      review it during the approval process.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ idDocumentUrl: null })}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"
                    disabled={isUploading}
                  >
                    <X size={16} className="text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Preview (blurred for privacy) */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-slate-200">
                <img
                  src={data.idDocumentUrl}
                  alt="ID Document"
                  className="w-full h-full object-cover blur-sm"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="text-center text-white">
                    <FileText size={40} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">Document Uploaded</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <label
              htmlFor="idUpload"
              className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl transition-all ${
                uploadError
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-300 cursor-pointer hover:border-brand hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-3 px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Upload size={32} className="text-slate-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Click to upload your ID
                  </p>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, or PDF up to 10MB
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield size={14} />
                  <span>Encrypted and secure</span>
                </div>
              </div>
              <input
                id="idUpload"
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          )}

          {uploadError && (
            <p className="text-xs text-red-600 font-medium">{uploadError}</p>
          )}

          {!uploadError && (
            <p className="text-xs text-slate-500 leading-relaxed">
              Make sure your full name and photo are clearly visible. Sensitive
              information will be handled securely and used only for
              verification.
            </p>
          )}
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
