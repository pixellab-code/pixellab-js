import { z } from "zod";
import { fetch } from "../utils/fetch";
import {
  Base64Image,
  ImageSize,
  ImageSizeSchema,
} from "../models/index.js";
import {
  CameraView,
  CameraViewSchema,
  Direction,
  DirectionSchema,
  Outline,
  OutlineSchema,
  Shading,
  ShadingSchema,
  Detail,
  DetailSchema,
} from "../types.js";
import { handleHttpError, ValidationError } from "../errors.js";
import type { PixelLabClient } from "../client.js";

export interface AnimateWithTextUsage {
  type: "usd";
  usd: number;
}

export interface AnimateWithTextParams {
  imageSize: ImageSize;
  description: string;
  action: string;
  referenceImage: Base64Image;
  view?: CameraView;
  direction?: Direction;
  negativeDescription?: string;
  textGuidanceScale?: number;
  imageGuidanceScale?: number;
  nFrames?: number;
  startFrameIndex?: number;
  initImages?: (Base64Image | null)[];
  initImageStrength?: number;
  inpaintingImages?: (Base64Image | null)[];
  maskImages?: (Base64Image | null)[];
  colorImage?: Base64Image;
  seed?: number;
}

export interface AnimateWithTextResponse {
  images: Base64Image[];
  usage: AnimateWithTextUsage;
}

const AnimateWithTextUsageSchema = z.object({
  type: z.literal("usd"),
  usd: z.number(),
});

const AnimateWithTextParamsSchema = z.object({
  imageSize: ImageSizeSchema,
  description: z.string().min(1),
  action: z.string().min(1),
  referenceImage: z.instanceof(Base64Image),
  view: CameraViewSchema.default("side"),
  direction: DirectionSchema.default("east"),
  negativeDescription: z.string().optional(),
  textGuidanceScale: z.number().min(1.0).max(20.0).default(7.5),
  imageGuidanceScale: z.number().min(1.0).max(20.0).default(1.5),
  nFrames: z.number().min(1).max(20).default(4),
  startFrameIndex: z.number().min(0).default(0),
  initImages: z.array(z.instanceof(Base64Image).nullable()).optional(),
  initImageStrength: z.number().min(1).max(999).default(300),
  inpaintingImages: z.array(z.instanceof(Base64Image).nullable()).optional(),
  maskImages: z.array(z.instanceof(Base64Image).nullable()).optional(),
  colorImage: z.instanceof(Base64Image).optional(),
  seed: z.number().default(0),
});

const AnimateWithTextResponseSchema = z.object({
  images: z.array(z.object({
    type: z.literal("base64"),
    base64: z.string(),
    format: z.string().optional().default("png"),
  })),
  usage: AnimateWithTextUsageSchema,
});

export async function animateWithText(
  this: PixelLabClient,
  params: AnimateWithTextParams
): Promise<AnimateWithTextResponse> {
  // Validate input parameters
  const validatedParams = AnimateWithTextParamsSchema.parse(params);

  // Python defaults inpainting_images to [None] * 4 if not provided
  const inpaintingImages = validatedParams.inpaintingImages || 
    Array.from({ length: 4 }, () => null);

  const requestData = {
    image_size: validatedParams.imageSize,
    description: validatedParams.description,
    action: validatedParams.action,
    negative_description: validatedParams.negativeDescription,
    text_guidance_scale: validatedParams.textGuidanceScale,
    image_guidance_scale: validatedParams.imageGuidanceScale,
    n_frames: validatedParams.nFrames,
    start_frame_index: validatedParams.startFrameIndex,
    view: validatedParams.view,
    direction: validatedParams.direction,
    reference_image: validatedParams.referenceImage.modelDump(),
    init_images: validatedParams.initImages
      ? validatedParams.initImages.map(img => img?.modelDump() || null)
      : null,
    init_image_strength: validatedParams.initImageStrength,
    inpainting_images: inpaintingImages.map(img => img?.modelDump() || null),
    mask_images: validatedParams.maskImages
      ? validatedParams.maskImages.map(img => img?.modelDump() || null)
      : null,
    color_image: validatedParams.colorImage?.modelDump() || null,
    seed: validatedParams.seed,
  };

  try {
    const response = await fetch(`${this.baseUrl}/animate-with-text`, {
      method: "POST",
      headers: {
        ...this.headers(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      await handleHttpError(response);
    }

    const data = await response.json();
    const parsedResponse = AnimateWithTextResponseSchema.parse(data);

    return {
      images: parsedResponse.images.map(imageData => Base64Image.fromData(imageData)),
      usage: parsedResponse.usage,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Response validation failed", error);
    }
    throw error;
  }
} 