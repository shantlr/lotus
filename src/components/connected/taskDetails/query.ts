import { graphql } from '@/gql/__generated/client';

export const QUERY_TASK_DETAIL = graphql(`
  query TaskDetails($id: ID!) {
    task(id: $id) {
      id
      title
      start
      end
      labels {
        id
        name
        color
      }
    }
  }
`);
