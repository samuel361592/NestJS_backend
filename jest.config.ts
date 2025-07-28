import type { CompilerOptions } from 'typescript';
import { compilerOptions } from './tsconfig.paths.json';
import { pathsToModuleNameMapper } from 'ts-jest';

const typedCompilerOptions = compilerOptions as CompilerOptions;

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: pathsToModuleNameMapper(typedCompilerOptions.paths ?? {}, {
    prefix: '<rootDir>/',
  }),
  transform: {
  '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    "src/entities/",
    "src/common/dto/",
    "src/auth/dto/",
    "src/post/dto/",
    "src/role/dto/",
    "src/user/dto/",
  ],
};
