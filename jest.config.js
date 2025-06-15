module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/cli.ts",
    "!src/mcp/**/*.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  // Run tests serially to avoid rate limit issues
  maxWorkers: 1,
};
