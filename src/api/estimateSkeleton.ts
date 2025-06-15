import { z } from "zod";
import {
  Base64Image,
  Keypoint,
  KeypointSchema,
} from "../models/index.js";
import { handleHttpError, ValidationError } from "../errors.js";
import type { PixelLabClient } from "../client.js";

export interface EstimateSkeletonUsage {
  type: "usd";
  usd: number;
}

export interface EstimateSkeletonParams {
  image: Base64Image;
}

export interface EstimateSkeletonResponse {
  keypoints: Keypoint[];
  usage: EstimateSkeletonUsage;
}

const EstimateSkeletonUsageSchema = z.object({
  type: z.literal("usd"),
  usd: z.number(),
});

const EstimateSkeletonParamsSchema = z.object({
  image: z.instanceof(Base64Image),
});

const EstimateSkeletonResponseSchema = z.object({
  keypoints: z.array(KeypointSchema),
  usage: EstimateSkeletonUsageSchema,
});

export async function estimateSkeleton(
  this: PixelLabClient,
  params: EstimateSkeletonParams
): Promise<EstimateSkeletonResponse> {
  // Validate input parameters
  const validatedParams = EstimateSkeletonParamsSchema.parse(params);

  const requestData = {
    image: validatedParams.image.modelDump(),
  };

  try {
    const response = await fetch(`${this.baseUrl}/estimate-skeleton`, {
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
    const parsedResponse = EstimateSkeletonResponseSchema.parse(data);

    return parsedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Response validation failed", error);
    }
    throw error;
  }
} 