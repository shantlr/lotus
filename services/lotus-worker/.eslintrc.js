/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  rules: {
    'import/no-named-as-default-member': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {
        // alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json by default
        // use <root>/path/to/folder/tsconfig.json
        // project: 'path/to/folder',
        // Multiple tsconfigs (Useful for monorepos)
        // use a glob pattern
        // project: 'packages/*/tsconfig.json',
        // use an array
        // project: [
        //   'packages/module-a/tsconfig.json',
        //   'packages/module-b/tsconfig.json',
        // ],
        // use an array of glob patterns
        // project: ['packages/*/tsconfig.json', 'other-packages/*/tsconfig.json'],
      },
    },
  },
};
