import { z } from "zod";

// Camera view types
export type CameraView = "side" | "low top-down" | "high top-down";

// Direction types
export type Direction =
  | "south"
  | "south-east"
  | "east"
  | "north-east"
  | "north"
  | "north-west"
  | "west"
  | "south-west";

// Outline types
export type Outline =
  | "single color black outline"
  | "single color outline"
  | "selective outline"
  | "lineless";

// Shading types
export type Shading =
  | "flat shading"
  | "basic shading"
  | "medium shading"
  | "detailed shading"
  | "highly detailed shading";

// Detail types
export type Detail = "low detail" | "medium detail" | "highly detailed";

// Skeleton label types
export type SkeletonLabel =
  | "NOSE"
  | "NECK"
  | "RIGHT SHOULDER"
  | "RIGHT ELBOW"
  | "RIGHT ARM"
  | "LEFT SHOULDER"
  | "LEFT ELBOW"
  | "LEFT ARM"
  | "RIGHT HIP"
  | "RIGHT KNEE"
  | "RIGHT LEG"
  | "LEFT HIP"
  | "LEFT KNEE"
  | "LEFT LEG"
  | "RIGHT EYE"
  | "LEFT EYE"
  | "RIGHT EAR"
  | "LEFT EAR";

// Zod schemas for validation
export const CameraViewSchema = z.enum([
  "side",
  "low top-down",
  "high top-down",
]);

export const DirectionSchema = z.enum([
  "south",
  "south-east",
  "east",
  "north-east",
  "north",
  "north-west",
  "west",
  "south-west",
]);

export const OutlineSchema = z.enum([
  "single color black outline",
  "single color outline",
  "selective outline",
  "lineless",
]);

export const ShadingSchema = z.enum([
  "flat shading",
  "basic shading",
  "medium shading",
  "detailed shading",
  "highly detailed shading",
]);

export const DetailSchema = z.enum([
  "low detail",
  "medium detail",
  "highly detailed",
]);

export const SkeletonLabelSchema = z.enum([
  "NOSE",
  "NECK",
  "RIGHT SHOULDER",
  "RIGHT ELBOW",
  "RIGHT ARM",
  "LEFT SHOULDER",
  "LEFT ELBOW",
  "LEFT ARM",
  "RIGHT HIP",
  "RIGHT KNEE",
  "RIGHT LEG",
  "LEFT HIP",
  "LEFT KNEE",
  "LEFT LEG",
  "RIGHT EYE",
  "LEFT EYE",
  "RIGHT EAR",
  "LEFT EAR",
]);
