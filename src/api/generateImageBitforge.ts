import { z } from "zod";
import { fetch } from "../utils/fetch";
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
  Detail,
  DetailSchema,
  Direction,
  DirectionSchema,
  Outline,
  OutlineSchema,
  Shading,
  ShadingSchema,
} from "../types.js";
import { handleHttpError, ValidationError } from "../errors.js";
import type { PixelLabClient } from "../client.js";
import { SkeletonFrame } from "./animateWithSkeleton.js";

export interface BitforgeUsage {
  type: "usd";
  usd: number;
}

export interface GenerateImageBitforgeParams {
  description: string;
  imageSize: ImageSize;
  negativeDescription?: string;
  textGuidanceScale?: number;
  extraGuidanceScale?: number;
  skeletonGuidanceScale?: number;
  styleStrength?: number;
  noBackground?: boolean;
  seed?: number;
  outline?: Outline;
  shading?: Shading;
  detail?: Detail;
  view?: CameraView;
  direction?: Direction;
  isometric?: boolean;
  obliqueProjection?: boolean;
  coveragePercentage?: number;
  initImage?: Base64Image;
  initImageStrength?: number;
  styleImage?: Base64Image;
  inpaintingImage?: Base64Image;
  maskImage?: Base64Image;
  skeletonKeypoints?: SkeletonFrame;
  colorImage?: Base64Image;
}

export interface GenerateImageBitforgeResponse {
  image: Base64Image;
  usage: BitforgeUsage;
}

const BitforgeUsageSchema = z.object({
  type: z.literal("usd"),
  usd: z.number(),
});

const SkeletonFrameSchema = z.object({
  keypoints: z.array(KeypointSchema),
});

const GenerateImageBitforgeParamsSchema = z.object({
  description: z.string().min(1).max(1000),
  imageSize: ImageSizeSchema,
  negativeDescription: z.string().default(""),
  textGuidanceScale: z.number().min(1).max(20).default(3.0),
  extraGuidanceScale: z.number().min(0).max(20).default(3.0),
  skeletonGuidanceScale: z.number().min(0).max(20).default(1.0),
  styleStrength: z.number().min(0).max(100).default(0.0),
  noBackground: z.boolean().default(false),
  seed: z.number().default(0),
  outline: OutlineSchema.optional(),
  shading: ShadingSchema.optional(),
  detail: DetailSchema.optional(),
  view: CameraViewSchema.optional(),
  direction: DirectionSchema.optional(),
  isometric: z.boolean().default(false),
  obliqueProjection: z.boolean().default(false),
  coveragePercentage: z.number().min(0).max(100).optional(),
  initImage: z.instanceof(Base64Image).optional(),
  initImageStrength: z.number().min(0).max(1000).default(300),
  styleImage: z.instanceof(Base64Image).optional(),
  inpaintingImage: z.instanceof(Base64Image).optional(),
  maskImage: z.instanceof(Base64Image).optional(),
  skeletonKeypoints: SkeletonFrameSchema.optional(),
  colorImage: z.instanceof(Base64Image).optional(),
});

const GenerateImageBitforgeResponseSchema = z.object({
  image: z.object({
    type: z.literal("base64"),
    base64: z.string(),
    format: z.string().optional().default("png"),
  }),
  usage: BitforgeUsageSchema,
});

export async function generateImageBitforge(
  this: PixelLabClient,
  params: GenerateImageBitforgeParams
): Promise<GenerateImageBitforgeResponse> {
  // Validate input parameters
  const validatedParams = GenerateImageBitforgeParamsSchema.parse(params);

  const requestData = {
    description: validatedParams.description,
    image_size: validatedParams.imageSize,
    negative_description: validatedParams.negativeDescription,
    text_guidance_scale: validatedParams.textGuidanceScale,
    extra_guidance_scale: validatedParams.extraGuidanceScale,
    style_strength: validatedParams.styleStrength,
    outline: validatedParams.outline,
    shading: validatedParams.shading,
    detail: validatedParams.detail,
    view: validatedParams.view,
    direction: validatedParams.direction,
    isometric: validatedParams.isometric,
    oblique_projection: validatedParams.obliqueProjection,
    no_background: validatedParams.noBackground,
    coverage_percentage: validatedParams.coveragePercentage,
    init_image: validatedParams.initImage?.modelDump() || null,
    init_image_strength: validatedParams.initImageStrength,
    style_image: validatedParams.styleImage?.modelDump() || null,
    inpainting_image: validatedParams.inpaintingImage?.modelDump() || null,
    mask_image: validatedParams.maskImage?.modelDump() || null,
    color_image: validatedParams.colorImage?.modelDump() || null,
    skeleton_keypoints: validatedParams.skeletonKeypoints || null,
    skeleton_guidance_scale: validatedParams.skeletonGuidanceScale,
    seed: validatedParams.seed,
  };

  try {
    const response = await fetch(`${this.baseUrl}/generate-image-bitforge`, {
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
    const parsedResponse = GenerateImageBitforgeResponseSchema.parse(data);

    return {
      image: Base64Image.fromData(parsedResponse.image),
      usage: parsedResponse.usage,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Response validation failed", error);
    }
    throw error;
  }
}
