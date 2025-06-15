import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

export interface Base64ImageData {
  type: "base64";
  base64: string;
  format: string;
}

export const Base64ImageSchema = z.object({
  type: z.literal("base64"),
  base64: z.string(),
  format: z.string().default("png"),
});

export class Base64Image {
  public readonly type: "base64" = "base64";
  public readonly base64: string;
  public readonly format: string;

  constructor(base64: string, format: string = "png") {
    this.base64 = base64;
    this.format = format;
  }

  static fromBuffer(buffer: Buffer, format: string = "png"): Base64Image {
    return new Base64Image(buffer.toString("base64"), format);
  }

  static async fromFile(filePath: string): Promise<Base64Image> {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const format = ext || "png";
    return new Base64Image(buffer.toString("base64"), format);
  }

  static fromData(data: Base64ImageData): Base64Image {
    return new Base64Image(data.base64, data.format);
  }

  toBuffer(): Buffer {
    return Buffer.from(this.base64, "base64");
  }

  async saveToFile(filePath: string): Promise<void> {
    const buffer = this.toBuffer();
    await fs.writeFile(filePath, buffer);
  }

  get dataUrl(): string {
    return `data:image/${this.format};base64,${this.base64}`;
  }

  get size(): number {
    return Buffer.byteLength(this.base64, "base64");
  }

  toJSON(): Base64ImageData {
    return {
      type: this.type,
      base64: this.base64,
      format: this.format,
    };
  }

  // For compatibility with Python's model_dump()
  modelDump(): Base64ImageData {
    return this.toJSON();
  }
} 