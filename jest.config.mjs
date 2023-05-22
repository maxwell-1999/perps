// jest.config.mjs
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],

  testEnvironment: 'jest-environment-jsdom',
}

const jestConfig = async () => {
  const nextJestConfig = await createJestConfig(config)()
  return {
    ...nextJestConfig,
    moduleNameMapper: {
      // Workaround to put our SVG mock first
      '\\.svg$': '<rootDir>/src/utils/__mocks__/svg.js',
      ...nextJestConfig.moduleNameMapper,
    },
  }
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default jestConfig
