import { LeadsContainer } from './components/leads-container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads | Dashboard',
  description: 'Leads management'
};

export default function LeadsPage() {
  return (
    <div className='container mx-auto py-6'>
      <LeadsContainer />
    </div>
  );
}
