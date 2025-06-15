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

export interface InpaintUsage {
  type: "usd";
  usd: number;
}

export interface InpaintParams {
  description: string;
  imageSize: ImageSize;
  inpaintingImage: Base64Image;
  maskImage: Base64Image;
  negativeDescription?: string;
  textGuidanceScale?: number;
  extraGuidanceScale?: number;
  outline?: Outline;
  shading?: Shading;
  detail?: Detail;
  view?: CameraView;
  direction?: Direction;
  isometric?: boolean;
  obliqueProjection?: boolean;
  noBackground?: boolean;
  initImage?: Base64Image;
  initImageStrength?: number;
  colorImage?: Base64Image;
  seed?: number;
}

export interface InpaintResponse {
  image: Base64Image;
  usage: InpaintUsage;
}

const InpaintUsageSchema = z.object({
  type: z.literal("usd"),
  usd: z.number(),
});

const InpaintParamsSchema = z.object({
  description: z.string().min(1),
  imageSize: ImageSizeSchema,
  inpaintingImage: z.instanceof(Base64Image),
  maskImage: z.instanceof(Base64Image),
  negativeDescription: z.string().default(""),
  textGuidanceScale: z.number().min(1.0).max(20.0).default(3.0),
  extraGuidanceScale: z.number().min(0.0).max(20.0).default(3.0),
  outline: OutlineSchema.optional(),
  shading: ShadingSchema.optional(),
  detail: DetailSchema.optional(),
  view: CameraViewSchema.optional(),
  direction: DirectionSchema.optional(),
  isometric: z.boolean().default(false),
  obliqueProjection: z.boolean().default(false),
  noBackground: z.boolean().default(false),
  initImage: z.instanceof(Base64Image).optional(),
  initImageStrength: z.number().min(0).max(1000).default(300),
  colorImage: z.instanceof(Base64Image).optional(),
  seed: z.number().default(0),
});

const InpaintResponseSchema = z.object({
  image: z.object({
    type: z.literal("base64"),
    base64: z.string(),
    format: z.string().optional().default("png"),
  }),
  usage: InpaintUsageSchema,
});

export async function inpaint(
  this: PixelLabClient,
  params: InpaintParams
): Promise<InpaintResponse> {
  // Validate input parameters
  const validatedParams = InpaintParamsSchema.parse(params);

  const requestData = {
    description: validatedParams.description,
    image_size: validatedParams.imageSize,
    negative_description: validatedParams.negativeDescription,
    text_guidance_scale: validatedParams.textGuidanceScale,
    extra_guidance_scale: validatedParams.extraGuidanceScale,
    outline: validatedParams.outline,
    shading: validatedParams.shading,
    detail: validatedParams.detail,
    view: validatedParams.view,
    direction: validatedParams.direction,
    isometric: validatedParams.isometric,
    oblique_projection: validatedParams.obliqueProjection,
    no_background: validatedParams.noBackground,
    init_image: validatedParams.initImage?.modelDump() || null,
    init_image_strength: validatedParams.initImageStrength,
    inpainting_image: validatedParams.inpaintingImage.modelDump(),
    mask_image: validatedParams.maskImage.modelDump(),
    color_image: validatedParams.colorImage?.modelDump() || null,
    seed: validatedParams.seed,
  };

  try {
    const response = await fetch(`${this.baseUrl}/inpaint`, {
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
    const parsedResponse = InpaintResponseSchema.parse(data);

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