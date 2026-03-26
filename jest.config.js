module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Specific paths first
    '^@/admin/hooks$': '<rootDir>/app/_hooks/admin/index',
    '^@/admin/hooks/(.*)$': '<rootDir>/app/_hooks/admin/$1',
    '^@/website/hooks$': '<rootDir>/app/_hooks/website/index',
    '^@/website/hooks/(.*)$': '<rootDir>/app/_hooks/website/$1',
    
    '^@/admin/types$': '<rootDir>/app/_types/admin/index',
    '^@/admin/types/(.*)$': '<rootDir>/app/_types/admin/$1',
    '^@/admin/utils$': '<rootDir>/app/_utils/admin/index',
    '^@/admin/utils/(.*)$': '<rootDir>/app/_utils/admin/$1',
    '^@/admin/constants$': '<rootDir>/app/_constants/admin/index',
    '^@/admin/constants/(.*)$': '<rootDir>/app/_constants/admin/$1',
    
    '^@/website/types$': '<rootDir>/app/_types/website/index',
    '^@/website/types/(.*)$': '<rootDir>/app/_types/website/$1',
    '^@/website/utils$': '<rootDir>/app/_utils/website/index',
    '^@/website/utils/(.*)$': '<rootDir>/app/_utils/website/$1',
    '^@/website/constants$': '<rootDir>/app/_constants/website/index',
    '^@/website/constants/(.*)$': '<rootDir>/app/_constants/website/$1',

    '^@/services/admin/(.*)$': '<rootDir>/app/_services/admin/$1',
    '^@/services/website/(.*)$': '<rootDir>/app/_services/website/$1',
    '^@/services$': '<rootDir>/app/_services/index',
    '^@/services/(.*)$': '<rootDir>/app/_services/$1',

    '^@/utils$': '<rootDir>/app/_utils/admin/index',
    '^@/utils/(.*)$': '<rootDir>/app/_utils/admin/$1',
    '^@/types$': '<rootDir>/app/_types/admin/index',
    '^@/types/(.*)$': '<rootDir>/app/_types/admin/$1',
    '^@/constants$': '<rootDir>/app/_constants/admin/index',
    '^@/constants/(.*)$': '<rootDir>/app/_constants/admin/$1',
    
    '^@/actions/(.*)$': '<rootDir>/app/_actions/$1',
    '^@/lib/(.*)$': '<rootDir>/app/_lib/$1',
    '^@/shared_assets/(.*)$': '<rootDir>/app/_shared_assets/$1',
    '^@/i18n/(.*)$': '<rootDir>/app/_i18n/$1',
    '^@/features/(.*)$': '<rootDir>/app/_features/$1',
    '^@/components/(.*)$': '<rootDir>/app/_components/$1',
    
    // Explicit exclusions for general paths to prevent shadowing
    '^@/admin/(?!hooks|types|utils|constants)(.*)$': '<rootDir>/app/_components/admin/$1',
    '^@/website/(?!hooks|types|utils|constants)(.*)$': '<rootDir>/app/_components/website/$1',
    
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json'
    }],
  },
};
