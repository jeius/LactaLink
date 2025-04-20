'use client';

import { Button, ConfirmationModal, toast, useModal } from '@payloadcms/ui';
import { useCallback, useState } from 'react';

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
  const heading = 'Do you want to proceed?';
  const body = (
    <>
      <span>
        This will populate the barangays, cities/municipalities, provinces, regions, and island
        groups. It will not delete any existing data, but may take a very long time to complete.
      </span>{' '}
      <strong>Once executed, you can&apos;t cancel the seeding.</strong>
    </>
  );

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
            const msg = 'message' in errData ? errData.message : 'An error occurred while seeding.';
            throw new Error(msg);
          }

          setSeeded(true);
        })(),
        {
          dismissible: false,
          closeButton: false,
          loading: 'Seeding PSGC data...',
          success: 'Seeding complete!',
          error: ({ message }) => message,
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
