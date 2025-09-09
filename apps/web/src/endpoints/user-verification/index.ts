'use server';

import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getServerSideURL } from '@/lib/utils/getURL';
import { extractErrorMessage, extractErrorStatus } from '@lactalink/utilities';
import { Canvas, Image, ImageData } from 'canvas';
import {
  detectSingleFace,
  env as faceApiEnv,
  FaceMatcher,
  nets,
  resizeResults,
  TinyFaceDetectorOptions,
} from 'face-api.js';
import { readFile } from 'fs';
import status from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import { createImageFromFile, validateImage } from './helpers';

const BASE_PATH = `${getServerSideURL()}/ai-models`;
const RECOGNITION_MODEL = `${BASE_PATH}/face_recognition`;
const DETECTION_MODEL = `${BASE_PATH}/tiny_face_detector`;
const LANDMARK_MODEL = `${BASE_PATH}/face_landmark_68_tiny`;

const MAX_DESCRIPTOR_DISTANCE = 0.5;

async function handler(req: PayloadRequest) {
  const { method } = req;

  if (method !== 'POST') {
    throw new APIError('HTTP Method Not Allowed', status.METHOD_NOT_ALLOWED, null, true);
  }

  const formData = await req.formData?.();
  const govIDFile = formData?.get('govID');
  const faceImageFile = formData?.get('face');

  // Ensure files are provided
  if (!govIDFile || !faceImageFile) {
    throw new APIError(
      'Missing required files: govID and faceImage',
      status.BAD_REQUEST,
      null,
      true
    );
  }

  // Check if the entries are File objects
  if (!(govIDFile instanceof File) || !(faceImageFile instanceof File)) {
    throw new APIError('Invalid file uploads', status.BAD_REQUEST, null, true);
  }

  try {
    // Dynamically import TensorFlow.js for Node.js
    // Optional but improves performance significantly
    // const _tf = await import('@tensorflow/tfjs-node');

    // Patch nodejs environment, we need to provide an implementation of
    // HTMLCanvasElement and HTMLImageElement
    // @ts-expect-error Expected type mismatch since we are monkey patching
    faceApiEnv.monkeyPatch({ Canvas, Image, ImageData, readFile });

    // Load models
    await Promise.all([
      nets.tinyFaceDetector.load(DETECTION_MODEL),
      nets.faceLandmark68TinyNet.load(LANDMARK_MODEL),
      nets.faceRecognitionNet.load(RECOGNITION_MODEL),
    ]);

    const [refImage, queryImage] = await Promise.all([
      createImageFromFile(faceImageFile),
      createImageFromFile(govIDFile),
    ]);

    // Process inputs
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
      throw new APIError('No face detected in reference image', status.BAD_REQUEST, null, true);
    }

    if (!queryFaceData) {
      throw new APIError('No face detected in government ID image', status.BAD_REQUEST, null, true);
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
    throw new APIError(
      extractErrorMessage(error) || 'Internal Server Error',
      extractErrorStatus(error) || status.INTERNAL_SERVER_ERROR,
      null,
      true
    );
  }
}

export const userVerificationHandler = createPayloadHandler({ handler });
