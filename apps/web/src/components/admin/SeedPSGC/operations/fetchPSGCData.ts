import { PSGCResponse } from '@lactalink/types';

/**
 * Fetches PSGC (Philippine Standard Geographic Code) data from the server.
 *
 * @returns {Promise<PSGCResponse['data']>} - The PSGC data retrieved from the server.
 *
 * @throws {Error} - Throws an error if the server response does not contain valid data.
 *
 * @description
 * This function sends a POST request to the `/api/seed/psgc` endpoint to retrieve PSGC data.
 * It expects the server to return a response containing the data in the `data` field.
 * If the response contains an error message, the function throws an error with the message.
 *
 * @example
 * const psgcData = await fetchPSGCData();
 * console.log(psgcData.islandGroups); // Logs the fetched island groups data
 */
export async function fetchPSGCData() {
  // Send a POST request to the PSGC API endpoint
  const psgcRes = await fetch('/api/seed/psgc', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Parse the response as a PSGCResponse object
  const psgc: PSGCResponse = await psgcRes.json();

  let psgcData;

  // Check if the response contains valid data
  if ('data' in psgc) {
    psgcData = psgc.data;
  } else {
    // Throw an error if the response contains an error message
    throw new Error(psgc.message);
  }

  // Return the fetched PSGC data
  return psgcData;
}
