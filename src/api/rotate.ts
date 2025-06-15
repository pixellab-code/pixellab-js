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

export interface RotateUsage {
  type: "usd";
  usd: number;
}

export interface RotateParams {
  imageSize: ImageSize;
  fromImage: Base64Image;
  fromView?: CameraView;
  toView?: CameraView;
  fromDirection?: Direction;
  toDirection?: Direction;
  viewChange?: number;
  directionChange?: number;
  imageGuidanceScale?: number;
  isometric?: boolean;
  obliqueProjection?: boolean;
  initImage?: Base64Image;
  initImageStrength?: number;
  maskImage?: Base64Image;
  colorImage?: Base64Image;
  seed?: number;
}

export interface RotateResponse {
  image: Base64Image;
  usage: RotateUsage;
}

const RotateUsageSchema = z.object({
  type: z.literal("usd"),
  usd: z.number(),
});

const RotateParamsSchema = z.object({
  imageSize: ImageSizeSchema,
  fromImage: z.instanceof(Base64Image),
  fromView: CameraViewSchema.optional(),
  toView: CameraViewSchema.optional(),
  fromDirection: DirectionSchema.optional(),
  toDirection: DirectionSchema.optional(),
  viewChange: z.number().optional(),
  directionChange: z.number().optional(),
  imageGuidanceScale: z.number().min(1.0).max(20.0).default(3.0),
  isometric: z.boolean().default(false),
  obliqueProjection: z.boolean().default(false),
  initImage: z.instanceof(Base64Image).optional(),
  initImageStrength: z.number().min(0).max(1000).default(300),
  maskImage: z.instanceof(Base64Image).optional(),
  colorImage: z.instanceof(Base64Image).optional(),
  seed: z.number().default(0),
});

const RotateResponseSchema = z.object({
  image: z.object({
    type: z.literal("base64"),
    base64: z.string(),
    format: z.string().optional().default("png"),
  }),
  usage: RotateUsageSchema,
});

export async function rotate(
  this: PixelLabClient,
  params: RotateParams
): Promise<RotateResponse> {
  // Validate input parameters
  const validatedParams = RotateParamsSchema.parse(params);

  const requestData = {
    image_size: validatedParams.imageSize,
    image_guidance_scale: validatedParams.imageGuidanceScale,
    from_view: validatedParams.fromView,
    to_view: validatedParams.toView,
    from_direction: validatedParams.fromDirection,
    to_direction: validatedParams.toDirection,
    view_change: validatedParams.viewChange,
    direction_change: validatedParams.directionChange,
    isometric: validatedParams.isometric,
    oblique_projection: validatedParams.obliqueProjection,
    init_image: validatedParams.initImage?.modelDump() || null,
    init_image_strength: validatedParams.initImageStrength,
    mask_image: validatedParams.maskImage?.modelDump() || null,
    from_image: validatedParams.fromImage.modelDump(),
    color_image: validatedParams.colorImage?.modelDump() || null,
    seed: validatedParams.seed,
  };

  try {
    const response = await fetch(`${this.baseUrl}/rotate`, {
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
    const parsedResponse = RotateResponseSchema.parse(data);

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