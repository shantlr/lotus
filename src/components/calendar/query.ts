import { graphql } from '@/gql/__generated/client';

export const QUERY_TASKS = graphql(`
  query CalendarTasks($input: GetTasksInput) {
    tasks(input: $input) {
      id
      title
      start
      end
    }
  }
`);
