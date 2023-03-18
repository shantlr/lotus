import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ['src/gql/schema/**/*.graphql'],
  // documents: 'src/**/*.tsx',
  generates: {
    // 'src/gql': {
    //   preset: 'client',
    //   plugins: [],
    // },
    // './graphql.schema.json': {
    //   plugins: ['introspection'],
    // },
    'src/gql/__generated/typeDefs.ts': {
      plugins: ['src/gql/plugins/typescript-typedefs.js'],
    },
    'src/gql/__generated/resolversTypes.ts': {
      config: {
        useIndexSignature: true,
      },
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
};

export default config;
