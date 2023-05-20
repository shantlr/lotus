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

export const DELETE_TASK_MUTATION = graphql(`
  mutation DeleteTask($input: DeleteTaskInput!) {
    deleteTask(input: $input)
  }
`);

export const UPDATE_TASK_MUT = graphql(`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      title
      start
      end
      labels {
        id
      }
      color
      secondaryColor
    }
  }
`);
