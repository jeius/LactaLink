'use client';

import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Button, ConfirmationModal, toast, useModal } from '@payloadcms/ui';
import { useCallback, useState } from 'react';
import { seedNotificationService } from './operation';

export default function SeedNotificationService() {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState('');

  const { openModal } = useModal();

  const modalSlug = 'seed-notifications';
  const heading = 'Do you want to proceed?';
  const body = (
    <>
      <span>
        This will reset the notification service to default categories and notification types. It
        will delete newly added categories and types.
      </span>{' '}
      <strong>Once executed, you can&apos;t cancel the process.</strong>
    </>
  );

  const handleSeed = useCallback(async () => {
    if (seeded) {
      toast.info('Notification service already resetted.');
      return;
    }
    if (loading) {
      toast.info('Notification service reset in progress.');
      return;
    }
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    const toastPromise = toast.promise(seedNotificationService, {
      dismissible: false,
      closeButton: false,
      loading: 'Resetting notification service...',
      success: () => {
        setSeeded(true);
        return 'Notification Service reset completed!';
      },
      error: (err) => {
        const errMsg = extractErrorMessage(err);
        setError(errMsg);
        return errMsg;
      },
    });

    await toastPromise.unwrap();

    setLoading(false);
  }, [seeded, loading, error]);

  return (
    <>
      <Button buttonStyle="secondary" onClick={() => openModal(modalSlug)}>
        Reset Notification Service
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
