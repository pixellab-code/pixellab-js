// Test setup file
import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

// Set test timeout to accommodate retries with exponential backoff
// Max retry scenario: 2s + 4s + 8s = 14s + buffer for actual API calls
jest.setTimeout(60000);
