module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  clearMocks: true,
  transform: {},
  transformIgnorePatterns: [
    'node_modules/(?!(marked-highlight|highlight.js)/)',
  ],
};
