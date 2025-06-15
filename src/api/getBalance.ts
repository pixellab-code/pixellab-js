import { z } from "zod";
import { handleHttpError, ValidationError } from "../errors.js";
import type { PixelLabClient } from "../client.js";
import { fetch } from "../utils/fetch";

export interface GetBalanceResponse {
  type: "usd";
  usd: number;
}

const GetBalanceResponseSchema = z.object({
  type: z.literal("usd"),
  usd: z.number(),
});

export async function getBalance(
  this: PixelLabClient
): Promise<GetBalanceResponse> {
  try {
    const response = await fetch(`${this.baseUrl}/balance`, {
      method: "GET",
      headers: this.headers(),
    });

    if (!response.ok) {
      await handleHttpError(response);
    }

    const data = await response.json();
    const parsedResponse = GetBalanceResponseSchema.parse(data);

    return parsedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Response validation failed", error);
    }
    throw error;
  }
}
