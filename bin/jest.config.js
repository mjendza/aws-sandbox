module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    "**/src/**",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/src/handlers/**",
  ],
  testMatch: ["**/?(*.)+(spec|test).ts"],
};
