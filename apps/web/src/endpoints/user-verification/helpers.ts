import { Image, loadImage } from 'canvas';
import { createCanvas, type NetInput, toNetInput } from 'face-api.js';
import status from 'http-status';
import { APIError } from 'payload';

export async function validateImage(image: Image): Promise<NetInput> {
  return await toNetInput(imageToCanvas(image));
}

export async function createImageFromFile(file: File): Promise<Image> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return await loadImage(buffer);
}

export function imageToCanvas(image: Image) {
  const canvas = createCanvas({ width: image.width, height: image.height });
  const ctx = canvas.getContext('2d');

  if (!ctx)
    throw new APIError('Failed to get canvas 2D context', status.INTERNAL_SERVER_ERROR, null, true);

  // @ts-expect-error Expected image type mismatch since we are monkey patching
  ctx.drawImage(image, 0, 0);

  return canvas;
}
