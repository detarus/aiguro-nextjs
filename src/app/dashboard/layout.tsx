import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import ConditionalHeader from '@/components/layout/conditional-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { OrganizationGuard } from '@/components/organization-guard';
import { PageHeaderProvider } from '@/contexts/PageHeaderContext';
import { FunnelsProvider } from '@/contexts/FunnelsContext';
import { SyncBlocker } from '@/components/sync-blocker';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import FunnelModalWrapper from './FunnelModalWrapper';

export const metadata: Metadata = {
  title: 'AI Guro Sales Platform',
  description: 'AI Guro Sales Platform'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <OrganizationGuard>
      <FunnelsProvider>
        <PageHeaderProvider>
          <KBar>
            <SidebarProvider defaultOpen={defaultOpen}>
              <SyncBlocker>
                <AppSidebar />
                <SidebarInset>
                  <ConditionalHeader />
                  {/* Onboarding modal (client-side only) */}
                  {/* <OnboardingModalWrapper /> */}
                  {/* page main content */}
                  {children}
                  {/* page main content ends */}
                </SidebarInset>
              </SyncBlocker>
            </SidebarProvider>
          </KBar>
          <FunnelModalWrapper />
        </PageHeaderProvider>
      </FunnelsProvider>
    </OrganizationGuard>
  );
}
