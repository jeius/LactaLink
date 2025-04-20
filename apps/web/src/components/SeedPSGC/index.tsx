'use client';

import { Button, ConfirmationModal, toast, useModal } from '@payloadcms/ui';
import Link from 'next/link';
import { useCallback, useState } from 'react';

const SuccessMessage: React.FC = () => (
  <div>
    Seeding Done! You can now{' '}
    <Link href="/" target="_blank">
      visit the website.
    </Link>
  </div>
);

const options: RequestInit = {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

export default function SeedPSGC() {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState('');

  const { openModal } = useModal();

  const modalSlug = 'seed-psgc';
  const heading = 'Are you absolutely sure?';
  const body = <span className="text-base">This may take a few minutes to complete.</span>;

  const handleReset = useCallback(async () => {
    if (seeded) {
      toast.info('PSGC data already seeded.');
      return;
    }
    if (loading) {
      toast.info('Seed already in progress.');
      return;
    }
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      await toast.promise(
        (async () => {
          const res = await fetch(`/api/seed/psgc`, options);

          if (!res.ok) {
            const errData = await res.json();
            const msg =
              'message' in errData ? errData.message : 'An error occurred while resetting.';
            throw new Error(msg);
          }

          setSeeded(true);
        })(),
        {
          loading: 'Seeding PSGC data...',
          success: <SuccessMessage />,
          error: 'An error occurred while seeding.',
          dismissible: false,
        }
      );
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        const msg = err.message as string;
        setError(msg || '');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, seeded, error]);

  return (
    <>
      <Button buttonStyle="primary" onClick={() => openModal(modalSlug)}>
        Seed PSGC Data
      </Button>
      <ConfirmationModal
        body={body}
        heading={heading}
        modalSlug={modalSlug}
        onConfirm={handleReset}
      />
    </>
  );
}
