import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { OrganizationGuard } from '@/components/organization-guard';
import { OrganizationCreationProvider } from '@/contexts/OrganizationCreationContext';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import OnboardingModalWrapper from '@/components/onboarding/onboarding-modal-wrapper';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn'
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
        <KBar>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
              <Header />
              {/* Onboarding modal (client-side only) */}
              {/* <OnboardingModalWrapper /> */}
              {/* page main content */}
              {children}
              {/* page main content ends */}
            </SidebarInset>
          </SidebarProvider>
        </KBar>
      </OrganizationCreationProvider>
    </OrganizationGuard>
  );
}
