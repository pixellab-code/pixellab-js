import { z } from "zod";
import { Response } from "./utils/fetch";

export class PixelLabError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "PixelLabError";
  }
}

export class AuthenticationError extends PixelLabError {
  constructor(message: string) {
    super(message, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends PixelLabError {
  constructor(
    message: string,
    public validationErrors?: z.ZodError
  ) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class RateLimitError extends PixelLabError {
  constructor(message: string) {
    super(message, "RATE_LIMIT_ERROR");
    this.name = "RateLimitError";
  }
}

export class HttpError extends PixelLabError {
  constructor(
    message: string,
    public status: number
  ) {
    super(message, "HTTP_ERROR");
    this.name = "HttpError";
  }
}

export async function handleHttpError(response: Response): Promise<never> {
  let errorData: any = {};
  try {
    errorData = await response.json();
  } catch {
    // Ignore JSON parsing errors
  }

  const message =
    errorData.detail ||
    errorData.message ||
    `HTTP ${response.status}: ${response.statusText}`;

  switch (response.status) {
    case 401:
      throw new AuthenticationError(message);
    case 422:
      throw new ValidationError(message);
    case 429:
      throw new RateLimitError(message);
    default:
      throw new HttpError(message, response.status);
  }
}
