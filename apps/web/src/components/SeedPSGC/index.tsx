'use client';

import { extractErrorMessage } from '@lactalink/utilities/errors';
import { Button, ConfirmationModal, toast, useModal } from '@payloadcms/ui';
import { useCallback, useState } from 'react';
import { seedPSGC } from './operations';

export default function SeedPSGC() {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState('');
  const [seedMessage, setSeedMessage] = useState('Seeding PSGC data...');

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

  const handleSeed = useCallback(async () => {
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
      toast.promise(
        (async () => {
          const result = await seedPSGC();

          if ('error' in result) {
            throw new Error(result.message, { cause: result.error });
          }

          setSeeded(true);
          setSeedMessage(result.message);
        })(),
        {
          dismissible: false,
          closeButton: false,
          loading: seedMessage,
          success: 'Seeding successfully completed!',
          error: ({ message }) => message,
        }
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [seeded, loading, error, seedMessage]);

  return (
    <>
      <Button buttonStyle="primary" onClick={() => openModal(modalSlug)}>
        Seed PSGC Data
      </Button>
      <ConfirmationModal
        body={body}
        heading={heading}
        modalSlug={modalSlug}
        onConfirm={handleSeed}
      />
    </>
  );
}
