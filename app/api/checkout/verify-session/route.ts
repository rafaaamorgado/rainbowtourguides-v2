import { NextRequest, NextResponse } from 'next/server';
import { verifyCheckoutSession } from '@/lib/checkout-verification';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session');

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'session parameter is required' },
        { status: 400 },
      );
    }

    const result = await verifyCheckoutSession(sessionId);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to verify session' },
      { status: 500 },
    );
  }
}
