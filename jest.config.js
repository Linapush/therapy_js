export default {
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
      testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'html'],
    testEnvironment: 'node', 
    };
    