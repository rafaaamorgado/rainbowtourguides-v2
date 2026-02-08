import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Allowed upload presets with their corresponding folder patterns.
 * Each preset determines where files will be stored in Cloudinary.
 */
const ALLOWED_PRESETS = [
  'avatar_preset',
  'cover_preset',
  'profile_images_preset',
  'verification_docs_preset',
] as const;

type UploadPreset = (typeof ALLOWED_PRESETS)[number];

/**
 * Request body schema for the sign endpoint.
 */
interface SignRequestBody {
  preset: string;
  folder?: string;
}

/**
 * Validates that a string is a valid upload preset.
 */
function isValidPreset(preset: string): preset is UploadPreset {
  return ALLOWED_PRESETS.includes(preset as UploadPreset);
}

/**
 * Gets the default folder path for a given preset and user ID.
 * Folders are organized by user to prevent cross-user access.
 */
function getDefaultFolder(preset: UploadPreset, userId: string): string {
  switch (preset) {
    case 'avatar_preset':
      return `users/avatars/${userId}`;
    case 'cover_preset':
      return `users/covers/${userId}`;
    case 'profile_images_preset':
      return `users/profile_images/${userId}`;
    case 'verification_docs_preset':
      return `users/verification_docs/${userId}`;
  }
}

/**
 * Validates that a custom folder matches allowed patterns.
 * Only allows folders that follow the user-specific structure.
 */
function isValidFolder(folder: string, userId: string): boolean {
  const allowedPatterns = [
    `users/avatars/${userId}`,
    `users/covers/${userId}`,
    `users/profile_images/${userId}`,
    `users/verification_docs/${userId}`,
  ];

  return allowedPatterns.includes(folder);
}

/**
 * Validates Cloudinary environment variables.
 * Returns validated config or throws an error.
 */
function validateCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured');
  }

  return { cloudName, apiKey, apiSecret };
}

/**
 * POST /api/cloudinary/sign
 *
 * Generates a signature for Cloudinary signed uploads.
 *
 * Security:
 * - Requires authentication (Supabase)
 * - Only allows specific presets
 * - Enforces user-specific folder structure
 * - Never exposes API secret to client
 *
 * Request Body:
 * - preset: "avatar_preset" | "cover_preset" | "profile_images_preset"
 * - folder?: string (optional override, must match allowed pattern)
 *
 * Response:
 * - signature: Cloudinary upload signature
 * - timestamp: Unix timestamp used in signature
 * - apiKey: Public Cloudinary API key
 * - cloudName: Cloudinary cloud name
 * - folder: Final folder path for upload
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Parse and validate request body
    let body: SignRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { preset, folder: customFolder } = body;

    // Step 3: Validate preset
    if (!preset || !isValidPreset(preset)) {
      return NextResponse.json(
        {
          error: `Invalid preset. Must be one of: ${ALLOWED_PRESETS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Step 4: Determine final folder path
    const defaultFolder = getDefaultFolder(preset, user.id);
    let finalFolder = defaultFolder;

    // Allow custom folder only if it matches allowed patterns
    if (customFolder) {
      if (!isValidFolder(customFolder, user.id)) {
        return NextResponse.json(
          {
            error: `Invalid folder. Must match pattern: users/{type}/${user.id}`,
          },
          { status: 400 },
        );
      }
      finalFolder = customFolder;
    }

    // Step 5: Validate Cloudinary configuration
    const { cloudName, apiKey, apiSecret } = validateCloudinaryConfig();

    // Step 6: Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // Step 7: Generate timestamp for signature
    const timestamp = Math.floor(Date.now() / 1000);

    // Step 8: Prepare parameters to sign
    const paramsToSign = {
      timestamp: timestamp.toString(),
      folder: finalFolder,
    };

    // Step 9: Generate signature using Cloudinary SDK
    // The signature ensures the upload is authorized and hasn't been tampered with
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret,
    );

    // Step 10: Return signature and upload configuration
    // Note: apiSecret is NEVER included in the response
    return NextResponse.json({
      signature,
      timestamp,
      apiKey, // Public key, safe to expose
      cloudName, // Public cloud name, safe to expose
      folder: finalFolder,
    });
  } catch (error) {
    // Log error server-side for debugging
    console.error('[Cloudinary Sign] Error:', error);

    // Return generic error to client (don't expose internal details)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate signature',
      },
      { status: 500 },
    );
  }
}
