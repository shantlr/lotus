const { printSchema } = require('graphql');

module.exports = {
  plugin: (schema, documents, config) => {
    return [
      'export const typeDefs = /* Graphql */ `',
      printSchema(schema),
      '`;',
      '',
    ].join('\n');
  },
};
