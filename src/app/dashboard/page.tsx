import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchAiguroServerToken } from '@/app/api/token/handler';

export default async function Dashboard() {
  console.log('[Dashboard Page] Attempting to fetch Aiguro token...');

  // fetchAiguroServerToken handles its own environment variable checks and logging for that.
  try {
    const token = await fetchAiguroServerToken();
    if (token) {
      console.log(
        '[Dashboard Page] Successfully fetched Aiguro token (server-side):',
        token
      );
    } else {
      // fetchAiguroServerToken already logs detailed errors, so a generic message here is fine.
      console.warn(
        '[Dashboard Page] Failed to retrieve Aiguro token server-side. Check server logs for details from fetchAiguroServerToken.'
      );
    }
  } catch (error) {
    // This catch is for unexpected errors during the call to fetchAiguroServerToken itself.
    console.error(
      '[Dashboard Page] Error explicitly caught while trying to get Aiguro token server-side:',
      error
    );
  }

  console.log('[Dashboard Page] Proceeding with Clerk auth and redirect...');
  const { userId } = await auth();

  if (!userId) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  }
}
