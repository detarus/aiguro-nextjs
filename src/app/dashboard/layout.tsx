import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import ConditionalHeader from '@/components/layout/conditional-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { OrganizationGuard } from '@/components/organization-guard';
import { OrganizationCreationProvider } from '@/contexts/OrganizationCreationContext';
import { PageHeaderProvider } from '@/contexts/PageHeaderContext';
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
      <OrganizationCreationProvider>
        <PageHeaderProvider>
          <KBar>
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar />
              <SidebarInset>
                <ConditionalHeader />
                {/* Onboarding modal (client-side only) */}
                {/* <OnboardingModalWrapper /> */}
                {/* page main content */}
                {children}
                {/* page main content ends */}
              </SidebarInset>
            </SidebarProvider>
          </KBar>
          <FunnelModalWrapper />
        </PageHeaderProvider>
      </OrganizationCreationProvider>
    </OrganizationGuard>
  );
}
