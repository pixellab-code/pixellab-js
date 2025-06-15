import { Client } from "../src/index";

describe("Get Balance", () => {
  test("should get account balance", async () => {
    const client = Client.fromEnvFile(".env.development.secrets");

    const response = await client.getBalance();

    // Verify we got a valid response
    expect(response).toBeDefined();
    expect(response.type).toBe("usd");
    expect(typeof response.usd).toBe("number");
    expect(response.usd).toBeGreaterThanOrEqual(0);
  });
});
