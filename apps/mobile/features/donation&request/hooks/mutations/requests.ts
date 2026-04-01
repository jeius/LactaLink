import { Request } from '@lactalink/types/payload-generated-types';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  createCancelRequestMutation,
  createRequestCreateMutation,
} from '../../lib/mutationOptions/requests';

export function useCancelRequest(doc: Request | null | undefined) {
  const [controller, setController] = useState(new AbortController());

  const { reset, ...mutation } = useMutation(
    createCancelRequestMutation(doc, { signal: controller.signal })
  );

  const handleAbort = useCallback(() => {
    controller.abort();
    reset();
  }, [controller, reset]);

  useEffect(() => () => handleAbort(), [handleAbort]);

  return {
    ...mutation,
    reset,
    cancelMutate: () => {
      handleAbort();
      setController(new AbortController());
    },
  };
}

export function useRequestCreateMutation() {
  const [controller, setController] = useState(new AbortController());

  const { reset, ...mutation } = useMutation(
    createRequestCreateMutation({ signal: controller.signal })
  );

  const handleAbort = useCallback(() => {
    controller.abort();
    reset();
  }, [controller, reset]);

  useEffect(() => () => handleAbort(), [handleAbort]);

  return {
    ...mutation,
    reset,
    cancelMutate: () => {
      handleAbort();
      setController(new AbortController());
    },
  };
}
