import { createBadRequestError } from '@/lib/utils/createError';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getServerSideURL, validateUrl } from '@/lib/utils/getURL';
import { IDVerficationTask } from '@lactalink/types';
import { extractErrorMessage, extractErrorStatus, mergeHeaders } from '@lactalink/utilities';
import { Canvas, Image, ImageData } from 'canvas';
import {
  detectSingleFace,
  env as faceApiEnv,
  FaceMatcher,
  nets,
  resizeResults,
  TinyFaceDetectorOptions,
} from 'face-api.js';
import status from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import { createImageFromResponse, validateImage } from './helpers';

const BASE_PATH = `${getServerSideURL()}/ai-models`;
const RECOGNITION_MODEL = `${BASE_PATH}/face_recognition`;
const DETECTION_MODEL = `${BASE_PATH}/tiny_face_detector`;
const LANDMARK_MODEL = `${BASE_PATH}/face_landmark_68_tiny`;

const MAX_DESCRIPTOR_DISTANCE = 0.5;

async function handler(req: PayloadRequest) {
  const { method, headers } = req;

  if (method !== 'POST') {
    throw new APIError('HTTP Method Not Allowed', status.METHOD_NOT_ALLOWED, null, true);
  }

  if (!headers.get('content-type')?.includes('application/json')) {
    throw new APIError(
      'Content-Type must be application/json',
      status.UNSUPPORTED_MEDIA_TYPE,
      null,
      true
    );
  }

  const body: IDVerficationTask['input'] | undefined = await req.json?.();
  const { queryImageUrl, refImageUrl } = body || {};

  const missingFields: string[] = [];

  if (!queryImageUrl) missingFields.push('queryImageUrl');
  if (!refImageUrl) missingFields.push('refImageUrl');

  if (missingFields.length) {
    throw createBadRequestError(`Missing required field(s): ${missingFields.join(', ')}`);
  }

  if (!validateUrl(queryImageUrl)) {
    throw createBadRequestError('Invalid queryImageUrl');
  }

  if (!validateUrl(refImageUrl)) {
    throw createBadRequestError('Invalid refImageUrl');
  }

  // Function to include auth headers in fetch requests made by face-api.js
  function modifiedFetch(url: string | URL, init?: RequestInit) {
    const headers = mergeHeaders(req.headers, new Headers(init?.headers));
    return fetch(url, { ...init, headers });
  }

  // Fetch the images
  const [refImageRes, queryImageRes] = await Promise.all([
    modifiedFetch(refImageUrl, { method: 'GET' }),
    modifiedFetch(queryImageUrl, { method: 'GET' }),
  ]);

  const failedRequests: string[] = [];

  if (!refImageRes.ok) failedRequests.push('reference image');
  if (!queryImageRes.ok) failedRequests.push('query image');

  if (failedRequests.length) {
    throw createBadRequestError(
      `Failed to fetch the following image(s): ${failedRequests.join(', ')}`
    );
  }

  try {
    // Patch nodejs environment, we need to provide an implementation of
    // HTMLCanvasElement and HTMLImageElement
    // @ts-expect-error Expected type mismatch since we are monkey patching
    faceApiEnv.monkeyPatch({ Canvas, Image, ImageData, fetch: modifiedFetch });

    // Load models
    await Promise.all([
      nets.tinyFaceDetector.load(DETECTION_MODEL),
      nets.faceLandmark68TinyNet.load(LANDMARK_MODEL),
      nets.faceRecognitionNet.load(RECOGNITION_MODEL),
    ]);

    // Create images from responses
    const [refImage, queryImage] = await Promise.all([
      createImageFromResponse(refImageRes),
      createImageFromResponse(queryImageRes),
    ]);

    // Process and validate inputs
    const [refInput, queryInput] = await Promise.all([
      validateImage(refImage),
      validateImage(queryImage),
    ]);

    // Large input size for query image (govID) as they tend to be smaller
    const queryDetectorOptions = new TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.6,
    });

    // Smaller input size for reference image (selfie)
    const refDetectorOptions = new TinyFaceDetectorOptions({
      inputSize: 160,
      scoreThreshold: 0.75,
    });

    // Generate face descriptors
    let [refFaceData, queryFaceData] = await Promise.all([
      detectSingleFace(refInput, refDetectorOptions).withFaceLandmarks(true).withFaceDescriptor(),
      detectSingleFace(queryInput, queryDetectorOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptor(),
    ]);

    if (!refFaceData) {
      throw createBadRequestError('No face detected in reference image');
    }

    if (!queryFaceData) {
      throw createBadRequestError('No face detected in government ID image');
    }

    refFaceData = resizeResults(refFaceData, refImage);
    queryFaceData = resizeResults(queryFaceData, queryImage);

    // Create FaceMatcher and find best match
    const matcher = new FaceMatcher(refFaceData);
    const bestMatch = matcher.findBestMatch(queryFaceData?.descriptor);

    const isVerified =
      bestMatch.label !== 'unknown' && bestMatch.distance <= MAX_DESCRIPTOR_DISTANCE;

    return {
      isVerified,
      label: bestMatch.label,
      distance: bestMatch.distance,
    };
  } catch (error) {
    throw new APIError(extractErrorMessage(error), extractErrorStatus(error), null, true);
  }
}

export const idVerificationHandler = createPayloadHandler({
  handler,
  successMessage: (_, data) => {
    return data.isVerified ? 'ID Verification successful.' : 'ID Verification failed.';
  },
});
