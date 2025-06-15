import { z } from "zod";

export interface ImageSize {
  width: number;
  height: number;
}

export const ImageSizeSchema = z.object({
  width: z.number().min(1).max(1024),
  height: z.number().min(1).max(1024),
});

export type ImageSizeInput = z.input<typeof ImageSizeSchema>;
