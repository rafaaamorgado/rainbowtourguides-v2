import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Request body schema
 */
interface DeleteRequestBody {
  publicId: string;
}

/**
 * Validates Cloudinary environment variables
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
 * Verifies that a public_id belongs to the authenticated user.
 * Public IDs should follow pattern: users/{type}/{userId}/{filename}
 *
 * @param publicId - Cloudinary public_id to verify
 * @param userId - Authenticated user's ID
 * @returns true if public_id belongs to user
 */
function verifyAssetOwnership(publicId: string, userId: string): boolean {
  // Expected patterns:
  // - users/avatars/{userId}/...
  // - users/covers/{userId}/...
  // - users/profile_images/{userId}/...

  const pattern = new RegExp(
    `^users/(avatars|covers|profile_images)/${userId}/`,
  );
  return pattern.test(publicId);
}

/**
 * POST /api/cloudinary/delete
 *
 * Deletes an asset from Cloudinary.
 *
 * Security:
 * - Requires authentication
 * - Verifies asset belongs to authenticated user
 * - Uses Admin API with secret key
 *
 * Request Body:
 * - publicId: string - Cloudinary public_id to delete
 *
 * Response:
 * - success: boolean
 * - message?: string
 * - error?: string
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
    let body: DeleteRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { publicId } = body;

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json(
        { error: 'publicId is required and must be a string' },
        { status: 400 },
      );
    }

    // Step 3: Verify asset ownership
    if (!verifyAssetOwnership(publicId, user.id)) {
      console.warn(
        `[Cloudinary Delete] User ${user.id} attempted to delete asset ${publicId} that doesn't belong to them`,
      );
      return NextResponse.json(
        { error: 'You do not have permission to delete this asset' },
        { status: 403 },
      );
    }

    // Step 4: Validate Cloudinary configuration
    const { cloudName, apiKey, apiSecret } = validateCloudinaryConfig();

    // Step 5: Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // Step 6: Delete asset from Cloudinary
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true, // Invalidate CDN cache
      });

      // Cloudinary returns result: 'ok' on success, 'not found' if already deleted
      if (result.result === 'ok' || result.result === 'not found') {
        return NextResponse.json({
          success: true,
          message: `Asset ${publicId} deleted successfully`,
        });
      } else {
        console.error('[Cloudinary Delete] Unexpected result:', result);
        return NextResponse.json(
          {
            success: false,
            error: `Delete failed with result: ${result.result}`,
          },
          { status: 500 },
        );
      }
    } catch (cloudinaryError) {
      console.error(
        '[Cloudinary Delete] Cloudinary API error:',
        cloudinaryError,
      );
      return NextResponse.json(
        {
          success: false,
          error:
            cloudinaryError instanceof Error
              ? cloudinaryError.message
              : 'Failed to delete from Cloudinary',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    // Log error server-side for debugging
    console.error('[Cloudinary Delete] Unexpected error:', error);

    // Return generic error to client
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete asset',
      },
      { status: 500 },
    );
  }
}
