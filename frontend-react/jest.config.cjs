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
  globals: {
    TextEncoder: { encoding: 'utf-8', encode: (str) => Buffer.from(str, 'utf-8') },
    TextDecoder: { decode: (buf) => Buffer.from(buf).toString('utf-8') },
  },
};