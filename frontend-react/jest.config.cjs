module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^leaflet$': '<rootDir>/node_modules/leaflet/dist/leaflet-src.js',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.spec.json',
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-leaflet|leaflet)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.tsx', '**/?(*.)+(spec|test).tsx'],
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};