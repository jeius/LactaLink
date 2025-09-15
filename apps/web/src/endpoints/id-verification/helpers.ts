import { extractErrorMessage, extractErrorStatus } from '@lactalink/utilities/extractors';
import { Image, loadImage } from 'canvas';
import { createCanvas, type NetInput, toNetInput } from 'face-api.js';
import status from 'http-status';
import { APIError } from 'payload';
import sharp from 'sharp';

export async function validateImage(image: Image): Promise<NetInput> {
  return await toNetInput(imageToCanvas(image));
}

export async function createImageFromResponse(res: Response): Promise<Image> {
  try {
    const buffer = Buffer.from(await res.arrayBuffer());

    // Convert unsupported formats to PNG
    const convertedBuffer = await sharp(buffer).toFormat('png', { lossless: true }).toBuffer();

    return await loadImage(convertedBuffer);
  } catch (error) {
    throw new APIError(
      `Failed to create image from file: ${extractErrorMessage(error)}`,
      extractErrorStatus(error) || status.BAD_REQUEST,
      null,
      true
    );
  }
}

export function imageToCanvas(image: Image) {
  try {
    const canvas = createCanvas({ width: image.width, height: image.height });
    const ctx = canvas.getContext('2d');

    if (!ctx)
      throw new APIError(
        'Failed to get canvas 2D context',
        status.INTERNAL_SERVER_ERROR,
        null,
        true
      );

    // @ts-expect-error Expected image type mismatch since we are monkey patching
    ctx.drawImage(image, 0, 0);

    return canvas;
  } catch (error) {
    throw new APIError(
      `Failed to convert image to canvas: ${extractErrorMessage(error)}`,
      extractErrorStatus(error) || status.BAD_REQUEST,
      null,
      true
    );
  }
}
