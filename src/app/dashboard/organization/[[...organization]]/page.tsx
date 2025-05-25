import { OrganizationProfile } from '@clerk/nextjs';

export const metadata = {
  title: 'Dashboard : Organization Control'
};

export default async function OrganizationPage() {
  return (
    <div className='flex w-full flex-col p-4'>
      <OrganizationProfile />
    </div>
  );
}
