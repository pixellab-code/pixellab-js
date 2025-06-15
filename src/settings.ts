import { config } from "dotenv";
import { z } from "zod";

export interface Settings {
  secret: string;
  baseUrl?: string;
}

const SettingsSchema = z.object({
  secret: z.string().min(1),
  baseUrl: z.string().url().optional(),
});

export function settings(envFile?: string): Settings {
  // Load environment variables from file if specified
  if (envFile) {
    config({ path: envFile });
  }

  const rawSettings = {
    secret: process.env.PIXELLAB_SECRET || process.env.PIXELLAB_API_KEY,
    baseUrl: process.env.PIXELLAB_BASE_URL,
  };

  // Validate settings
  const parsed = SettingsSchema.parse(rawSettings);
  return parsed;
}
