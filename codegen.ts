import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ['src/gql/schema/**/*.graphql', 'src/pages/api/graphql/**/*.gql'],
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    'src/gql/__generated/client/': {
      preset: 'client',
    },
    'src/gql/__generated/client/graphcache.ts': {
      plugins: ['typescript', 'typescript-urql-graphcache'],
    },
    'src/gql/__generated/typeDefs.ts': {
      plugins: ['src/gql/plugins/typescript-typedefs.js'],
      config: {
        Date: 'string',
      },
    },
    'src/gql/__generated/resolversTypes.ts': {
      config: {
        useIndexSignature: true,
        strictScalars: true,
        defaultScalarType: 'unknown',
        scalars: {
          DateTime: 'Date',
        },
      },
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
};

export default config;
