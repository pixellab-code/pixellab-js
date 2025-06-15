import { z } from "zod";
import {
  Base64Image,
  ImageSize,
  ImageSizeSchema,
  Keypoint,
  KeypointSchema,
} from "../models/index.js";
import {
  CameraView,
  CameraViewSchema,
  Direction,
  DirectionSchema,
} from "../types.js";
import { handleHttpError, ValidationError } from "../errors.js";
import type { PixelLabClient } from "../client.js";

export interface SkeletonFrame {
  keypoints: Keypoint[];
}

export interface AnimateWithSkeletonUsage {
  type: "usd";
  usd: number;
}

export interface AnimateWithSkeletonParams {
  imageSize: ImageSize;
  skeletonKeypoints: SkeletonFrame[];
  view: CameraView;
  direction: Direction;
  referenceGuidanceScale?: number;
  poseGuidanceScale?: number;
  isometric?: boolean;
  obliqueProjection?: boolean;
  initImages?: Base64Image[];
  initImageStrength?: number;
  referenceImage?: Base64Image;
  inpaintingImages?: (Base64Image | null)[];
  maskImages?: (Base64Image | null)[];
  colorImage?: Base64Image;
  seed?: number;
}

export interface AnimateWithSkeletonResponse {
  images: Base64Image[];
  usage: AnimateWithSkeletonUsage;
}

const SkeletonFrameSchema = z.object({
  keypoints: z.array(KeypointSchema),
});

const AnimateWithSkeletonUsageSchema = z.object({
  type: z.literal("usd"),
  usd: z.number(),
});

const AnimateWithSkeletonParamsSchema = z.object({
  imageSize: ImageSizeSchema,
  skeletonKeypoints: z.array(SkeletonFrameSchema),
  view: CameraViewSchema,
  direction: DirectionSchema,
  referenceGuidanceScale: z.number().min(1.0).max(20.0).default(1.1),
  poseGuidanceScale: z.number().min(1.0).max(20.0).default(3.0),
  isometric: z.boolean().default(false),
  obliqueProjection: z.boolean().default(false),
  initImages: z.array(z.instanceof(Base64Image)).optional(),
  initImageStrength: z.number().min(0).max(1000).default(300),
  referenceImage: z.instanceof(Base64Image).optional(),
  inpaintingImages: z.array(z.instanceof(Base64Image).nullable()).optional(),
  maskImages: z.array(z.instanceof(Base64Image).nullable()).optional(),
  colorImage: z.instanceof(Base64Image).optional(),
  seed: z.number().default(0),
});

const AnimateWithSkeletonResponseSchema = z.object({
  images: z.array(z.object({
    type: z.literal("base64"),
    base64: z.string(),
    format: z.string().optional().default("png"),
  })),
  usage: AnimateWithSkeletonUsageSchema,
});

export async function animateWithSkeleton(
  this: PixelLabClient,
  params: AnimateWithSkeletonParams
): Promise<AnimateWithSkeletonResponse> {
  // Validate input parameters
  const validatedParams = AnimateWithSkeletonParamsSchema.parse(params);

  const requestData = {
    image_size: validatedParams.imageSize,
    reference_guidance_scale: validatedParams.referenceGuidanceScale,
    pose_guidance_scale: validatedParams.poseGuidanceScale,
    view: validatedParams.view,
    direction: validatedParams.direction,
    isometric: validatedParams.isometric,
    oblique_projection: validatedParams.obliqueProjection,
    init_images: validatedParams.initImages
      ? validatedParams.initImages.map(img => img.modelDump())
      : null,
    init_image_strength: validatedParams.initImageStrength,
    skeleton_keypoints: validatedParams.skeletonKeypoints,
    reference_image: validatedParams.referenceImage?.modelDump() || null,
    inpainting_images: validatedParams.inpaintingImages
      ? validatedParams.inpaintingImages.map(img => img?.modelDump() || null)
      : null,
    mask_images: validatedParams.maskImages
      ? validatedParams.maskImages.map(img => img?.modelDump() || null)
      : null,
    color_image: validatedParams.colorImage?.modelDump() || null,
    seed: validatedParams.seed,
  };

  try {
    const response = await fetch(`${this.baseUrl}/animate-with-skeleton`, {
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
    const parsedResponse = AnimateWithSkeletonResponseSchema.parse(data);

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