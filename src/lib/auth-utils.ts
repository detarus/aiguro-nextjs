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
      return null;
    }

    // The __session cookie from Clerk typically contains a JWT token
    // We'll use it directly as the authorization token
    return sessionCookie.value;
  } catch (error) {
    console.error('Error extracting token from cookie:', error);
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
      return null;
    }

    const token = sessionCookie.split('=')[1];
    return token;
  } catch (error) {
    console.error('Error extracting token from client cookie:', error);
    return null;
  }
}
