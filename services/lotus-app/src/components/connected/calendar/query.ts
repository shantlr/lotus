import { graphql } from '@/gql/__generated/client';

export const QUERY_CAL_EVENTS = graphql(`
  query GetCalendarEvents($input: GetCalendarEventsInput) {
    calendarEvents(input: $input) {
      id
      title
      start
      end
      color
      secondaryColor
    }
  }
`);
