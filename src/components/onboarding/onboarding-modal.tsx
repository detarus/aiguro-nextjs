'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

const INITIAL_COMPANIES = ['Acme Inc', 'Beta Corp', 'Gamma Ltd'];

const checkCompanyExists = async (companyName: string, companies: string[]) => {
  return companies.includes(companyName);
};

const useOnboardingStatus = () => {
  const [completed, setCompleted] = useState(false);
  return { completed, setCompleted };
};

export default function OnboardingModal() {
  const { user } = useUser();
  const { completed, setCompleted } = useOnboardingStatus();
  const [isOpen, setIsOpen] = useState(!completed);
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [companies, setCompanies] = useState<string[]>([...INITIAL_COMPANIES]);

  if (!user || completed) return null;

  const handleNext = async () => {
    setError('');
    setChecking(true);
    const exists = await checkCompanyExists(companyName, companies);
    setChecking(false);
    if (exists) {
      toast.success(
        `Invitation to join '${companyName}' has been sent to the company moderator.`
      );
      setStep(2);
    } else {
      // Add new company to the list
      setCompanies((prev) => [...prev, companyName]);
      setStep(2);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCompleted(true);
  };

  const handleCompanyClick = (name: string) => {
    setCompanyName(name);
    setStep(1);
    setError('');
  };

  return (
    <Modal
      title='User onboarding'
      description={
        step === 1
          ? 'Add an existing company or create a new one to get started.'
          : 'Step 2 placeholder. Please provide details for step 2.'
      }
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className='mx-auto w-full max-w-xl p-6'>
        {/* Custom heading and details */}
        <div className='mb-6 flex flex-col items-center gap-2'>
          <span className='text-2xl font-bold'>User onboarding</span>
          <span className='text-lg font-semibold'>
            {step === 1 ? 'Create a Company' : 'Onboarding Step 2'}
          </span>
          {step === 1 && (
            <div className='mt-2 text-center text-base'>
              Welcome! To get started, please add your company.
              <br />
              <span className='text-muted-foreground'>
                You can add an existing company (if it already exists in our
                system) or create a new one.
                <br />
                If you add an existing company, an invitation will be sent to
                the company moderator for approval.
              </span>
            </div>
          )}
        </div>
        {/* Company list */}
        {step === 1 && (
          <div className='mb-6'>
            <div className='mb-2 font-medium'>Companies in the system:</div>
            <div className='flex flex-wrap gap-2'>
              {companies.map((c) => (
                <Button
                  key={c}
                  variant={companyName === c ? 'default' : 'outline'}
                  size='sm'
                  className='rounded-full px-4'
                  onClick={() => handleCompanyClick(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        )}
        {/* Step 1: Company input */}
        {step === 1 && (
          <div className='space-y-6'>
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='companyName'
                className='text-left text-base font-medium'
              >
                Company Name
              </label>
              <Input
                id='companyName'
                placeholder='Enter your company name'
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={checking}
                className='h-12 text-lg'
              />
            </div>
            {error && (
              <div className='text-center text-sm text-red-500'>{error}</div>
            )}
            <Button
              className='h-12 w-full text-lg'
              onClick={handleNext}
              disabled={!companyName || checking}
            >
              Next
            </Button>
          </div>
        )}
        {/* Step 2: Placeholder */}
        {step === 2 && (
          <div className='space-y-6 text-center'>
            <div className='text-lg font-medium'>
              Step 2 placeholder. Please provide details for step 2.
            </div>
            <Button className='h-12 w-full text-lg' onClick={handleClose}>
              Finish
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
