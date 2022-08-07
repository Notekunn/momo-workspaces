/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['lib'],
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
}
