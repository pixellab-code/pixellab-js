import { z } from "zod";
import {
  Base64Image,
  Base64ImageData,
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

export interface PixfluxUsage {
  type: "usd";
  usd: number;
}

export interface GenerateImagePixfluxParams {
  description: string;
  imageSize: ImageSize;
  negativeDescription?: string;
  textGuidanceScale?: number;
  outline?: Outline;
  shading?: Shading;
  detail?: Detail;
  view?: CameraView;
  direction?: Direction;
  isometric?: boolean;
  noBackground?: boolean;
  coveragePercentage?: number;
  initImage?: Base64Image;
  initImageStrength?: number;
  colorImage?: Base64Image;
  seed?: number;
}

export interface GenerateImagePixfluxResponse {
  image: Base64Image;
  usage: PixfluxUsage;
}

const PixfluxUsageSchema = z.object({
  type: z.literal("usd"),
  usd: z.number(),
});

const GenerateImagePixfluxParamsSchema = z.object({
  description: z.string().min(1).max(1000),
  imageSize: ImageSizeSchema,
  negativeDescription: z.string().default(""),
  textGuidanceScale: z.number().min(1).max(20).default(8),
  outline: OutlineSchema.optional(),
  shading: ShadingSchema.optional(),
  detail: DetailSchema.optional(),
  view: CameraViewSchema.optional(),
  direction: DirectionSchema.optional(),
  isometric: z.boolean().default(false),
  noBackground: z.boolean().default(false),
  coveragePercentage: z.number().min(0).max(100).optional(),
  initImage: z.instanceof(Base64Image).optional(),
  initImageStrength: z.number().min(0).max(1000).default(300),
  colorImage: z.instanceof(Base64Image).optional(),
  seed: z.number().default(0),
});

const GenerateImagePixfluxResponseSchema = z.object({
  image: z.object({
    type: z.literal("base64"),
    base64: z.string(),
    format: z.string().optional().default("png"),
  }),
  usage: PixfluxUsageSchema,
});

export async function generateImagePixflux(
  this: PixelLabClient,
  params: GenerateImagePixfluxParams
): Promise<GenerateImagePixfluxResponse> {
  // Validate input parameters
  const validatedParams = GenerateImagePixfluxParamsSchema.parse(params);

  const requestData = {
    description: validatedParams.description,
    image_size: validatedParams.imageSize,
    negative_description: validatedParams.negativeDescription,
    text_guidance_scale: validatedParams.textGuidanceScale,
    outline: validatedParams.outline,
    shading: validatedParams.shading,
    detail: validatedParams.detail,
    view: validatedParams.view,
    direction: validatedParams.direction,
    isometric: validatedParams.isometric,
    no_background: validatedParams.noBackground,
    coverage_percentage: validatedParams.coveragePercentage,
    init_image: validatedParams.initImage?.modelDump() || null,
    init_image_strength: validatedParams.initImageStrength,
    color_image: validatedParams.colorImage?.modelDump() || null,
    seed: validatedParams.seed,
  };

  try {
    const response = await fetch(`${this.baseUrl}/generate-image-pixflux`, {
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
    const parsedResponse = GenerateImagePixfluxResponseSchema.parse(data);

    return {
      image: Base64Image.fromData(parsedResponse.image),
      usage: parsedResponse.usage,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation Error Details:", error.errors);
      throw new ValidationError("Response validation failed", error);
    }
    throw error;
  }
}
