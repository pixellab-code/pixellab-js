import { promises as fs } from "fs";
import path from "path";
import { Client, Base64Image } from "../src/index";
import { retryWithBackoff } from "./utils";

describe("Generate Image Bitforge", () => {
  test("should generate image with bitforge", async () => {
    const client = Client.fromEnvFile(".env.development.secrets");

    // Load test images
    const imagesDir = path.join("tests", "images");
    const styleImage = await Base64Image.fromFile(
      path.join(imagesDir, "boy.png")
    );
    const inpaintingImage = await Base64Image.fromFile(
      path.join(imagesDir, "boy.png")
    );
    const maskImage = await Base64Image.fromFile(
      path.join(imagesDir, "mask.png")
    );
    const initImage = await Base64Image.fromFile(
      path.join(imagesDir, "boy.png")
    );

    const response = await retryWithBackoff(async () => {
      return await client.generateImageBitforge({
        description: "boy with wings",
        imageSize: { width: 16, height: 16 },
        noBackground: true,
        styleImage,
        inpaintingImage,
        maskImage,
        initImage,
        initImageStrength: 250,
      });
    });

    // Verify we got a valid response
    expect(response.image).toBeDefined();
    expect(response.image.base64).toBeDefined();
    expect(response.image.format).toBeDefined();
    expect(response.usage).toBeDefined();
    expect(response.usage.type).toBe("usd");
    expect(typeof response.usage.usd).toBe("number");

    // Verify image buffer
    const buffer = response.image.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // Create results directory
    const resultsDir = path.join("tests", "results");
    await fs.mkdir(resultsDir, { recursive: true });

    // Save the generated image
    const outputPath = path.join(resultsDir, "bitforge_boy_with_wings.png");
    await response.image.saveToFile(outputPath);

    // Verify file was created
    const stats = await fs.stat(outputPath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
