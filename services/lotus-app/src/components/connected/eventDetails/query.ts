import { graphql } from '@/gql/__generated/client';

export const GET_CAL_EVENT_DETAIL_QUERY = graphql(`
  query GetCalendarEventDetails($id: ID!) {
    calendarEvent(id: $id) {
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

export const DELETE_EVENT_MUTATION = graphql(`
  mutation DeleteCalendarEvent($input: DeleteCalendarEventInput!) {
    deleteCalendarEvent(input: $input)
  }
`);

export const UPDATE_EVENT_MUTATION = graphql(`
  mutation UpdateCalendarEvent($input: UpdateCalendarEventInput!) {
    updateCalendarEvent(input: $input) {
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
