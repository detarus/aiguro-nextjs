'use client';

import { OrganizationDebug } from '@/components/organization-debug';
import { UserDebug } from '@/components/user-debug';
import { OrganizationApiDebug } from '@/components/organization-api-debug';
import { FunnelDebug } from '@/components/funnel-debug';
import { TokenDebug } from '@/components/token-debug';
import { MessengerConnectionsDebug } from '@/components/messenger-connections-debug';
import { TestDialogsDebug } from '@/components/test-dialogs-debug';
import { DialogsDebug } from '@/components/dialogs-debug';
import { ClientsDebug } from '@/components/clients-debug';
import { AssistantsDebug } from '@/components/assistants-debug';
import { FilesDebug } from '@/components/files-debug';
import { PageContainer } from '@/components/ui/page-container';

export default function DebugPage() {
  return (
    <PageContainer>
      <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
        <OrganizationDebug />
        <UserDebug />
        <OrganizationApiDebug />
        <FunnelDebug />
        <TokenDebug />
        <MessengerConnectionsDebug />
        <TestDialogsDebug />
        <DialogsDebug />
        <ClientsDebug />
        <AssistantsDebug />
        <FilesDebug />
      </div>
    </PageContainer>
  );
}
