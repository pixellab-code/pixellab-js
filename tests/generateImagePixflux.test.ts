import { promises as fs } from "fs";
import path from "path";
import { Client } from "../src/index";
import { retryWithBackoff } from "./utils";

describe("Generate Image Pixflux", () => {
  test("should generate image with pixflux", async () => {
    const client = Client.fromEnvFile(".env.development.secrets");

    const response = await retryWithBackoff(async () => {
      return await client.generateImagePixflux({
        description: "cute dragon",
        imageSize: { width: 64, height: 64 },
        noBackground: false,
        textGuidanceScale: 8.0,
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
    const outputPath = path.join(resultsDir, "pixflux_cute_dragon.png");
    await response.image.saveToFile(outputPath);

    // Verify file was created
    const stats = await fs.stat(outputPath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
