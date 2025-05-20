import { NextResponse } from 'next/server';
import { fetchAiguroServerToken } from './handler';

export async function GET() {
  try {
    const token = await fetchAiguroServerToken();

    if (token) {
      return NextResponse.json({ token });
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
