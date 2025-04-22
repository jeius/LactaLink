import { PSGCResponse } from '@lactalink/types';

export async function fetchPSGCData() {
  const psgcRes = await fetch('/api/seed/psgc', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const psgc: PSGCResponse = await psgcRes.json();

  let psgcData;

  if ('data' in psgc) {
    psgcData = psgc.data;
  } else {
    throw new Error(psgc.message);
  }

  return psgcData;
}
