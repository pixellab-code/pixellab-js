import { z } from "zod";
import { SkeletonLabel, SkeletonLabelSchema } from "../types.js";

export interface Keypoint {
  x: number;
  y: number;
  label: SkeletonLabel;
  zIndex?: number;
}

export const KeypointSchema = z.object({
  x: z.number(),
  y: z.number(),
  label: SkeletonLabelSchema,
  zIndex: z.number().default(0.0),
});

export type KeypointInput = z.input<typeof KeypointSchema>;
