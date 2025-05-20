import { NextResponse } from 'next/server';

const AIGURO_API_URL = 'https://app.dev.aiguro.ru/api';

/**
 * Fetches the Aiguro API access token.
 * This function is intended for server-side use only.
 */
export async function fetchAiguroServerToken(): Promise<string | null> {
  const username = process.env.AIGURO_USERNAME;
  const password = process.env.AIGURO_PASSWORD;

  if (!username || !password) {
    // This check might seem redundant with hardcoding but kept for structure
    console.error(
      '[fetchAiguroServerToken] Username or Password was unexpectedly empty (should be hardcoded for this test).'
    );
    return null;
  }

  console.log(
    `[fetchAiguroServerToken] DEBUG: Using username: ${username}, password: ${password.substring(0, 2)}... (password partially masked)`
  );

  try {
    const response = await fetch(`${AIGURO_API_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json' // Added as per cURL
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password,
        refresh_token: '',
        scope: '',
        client_id: 'string',
        client_secret: 'string'
      })
    });

    if (!response.ok) {
      let errorData = {
        detail: `Status: ${response.status}. Failed to fetch token, and error response was not valid JSON.`
      };
      try {
        errorData = await response.json();
      } catch (e) {
        console.warn(
          '[fetchAiguroServerToken] Could not parse error response as JSON.',
          e
        );
      }
      console.error(
        '[fetchAiguroServerToken] Failed to fetch access token:',
        response.status,
        errorData
      );
      return null;
    }

    const data = await response.json();

    if (data && data.access_token) {
      console.log(
        '[fetchAiguroServerToken] Successfully fetched access token with hardcoded credentials.'
      );
      return data.access_token;
    } else {
      console.error(
        '[fetchAiguroServerToken] Access token not found in response (with hardcoded credentials):',
        data
      );
      return null;
    }
  } catch (error) {
    console.error(
      '[fetchAiguroServerToken] Error during fetch operation (with hardcoded credentials):',
      error
    );
    return null;
  }
}

export async function GET() {
  try {
    const token = await fetchAiguroServerToken();

    if (token) {
      return NextResponse.json({ token });
    } else {
      console.error(
        '[/api/aiguro-token GET] Failed to retrieve Aiguro token from provider (fetchAiguroServerToken returned null - check its logs).'
      );
      return NextResponse.json(
        {
          error:
            'Failed to retrieve Aiguro token from provider. Check server logs.'
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('[/api/aiguro-token GET] Unexpected error:', error);
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
