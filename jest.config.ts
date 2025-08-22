const defineJestConfig =
  require('@tarojs/test-utils-react/dist/jest.js').default

module.exports = defineJestConfig({
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/?(*.)+(spec|test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/app.config.ts',
    '!src/services/mock.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transformIgnorePatterns: ['node_modules/(?!(@tarojs|taro-ui)/)'],
})
