import { NextRequest } from 'next/server';

/**
 * Extracts the Clerk token from the __session cookie
 * @param request - The NextRequest object containing cookies
 * @returns The token string or null if not found
 */
export function getClerkTokenFromCookie(request: NextRequest): string | null {
  try {
    const sessionCookie = request.cookies.get('__session');

    if (!sessionCookie?.value) {
      console.log('[getClerkTokenFromCookie] No __session cookie found');
      return null;
    }

    console.log(
      '[getClerkTokenFromCookie] __session cookie value:',
      sessionCookie.value
    );

    // The __session cookie from Clerk typically contains a JWT token
    // We'll use it directly as the authorization token
    return sessionCookie.value;
  } catch (error) {
    console.error(
      '[getClerkTokenFromCookie] Error extracting token from cookie:',
      error
    );
    return null;
  }
}

/**
 * Alternative function to get token from cookies in client-side code
 * @returns The token string or null if not found
 */
export function getClerkTokenFromClientCookie(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('__session=')
    );

    if (!sessionCookie) {
      console.log('[getClerkTokenFromClientCookie] No __session cookie found');
      return null;
    }

    const token = sessionCookie.split('=')[1];
    console.log(
      '[getClerkTokenFromClientCookie] __session cookie value:',
      token
    );

    return token;
  } catch (error) {
    console.error(
      '[getClerkTokenFromClientCookie] Error extracting token from cookie:',
      error
    );
    return null;
  }
}
