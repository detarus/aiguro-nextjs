import { NextResponse } from 'next/server';
import { fetchAiguroServerToken } from './handler';

/**
 * @deprecated This endpoint is deprecated. API routes now use Clerk tokens directly from  __session cookie.
 * This endpoint remains for backward compatibility but should not be used in new implementations.
 */
export async function GET() {
  console.warn(
    '[DEPRECATED] /api/token endpoint is deprecated. Use Clerk tokens from  __session cookie instead.'
  );

  try {
    const token = await fetchAiguroServerToken();

    if (token) {
      return NextResponse.json({
        token,
        deprecated: true,
        message:
          'This endpoint is deprecated. Use Clerk tokens from  __session cookie instead.'
      });
    } else {
      return NextResponse.json(
        {
          error:
            'Failed to retrieve Aiguro token from provider. Check server logs.'
        },
        { status: 502 }
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during token retrieval.';
    return NextResponse.json(
      {
        error: 'Internal server error while fetching Aiguro token.',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
