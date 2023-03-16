import CalendarPage from '.';

export default function TypedCalendarPage({ type }: { type: string }) {
  return <CalendarPage type={type} />;
}

export async function getStaticPaths() {
  // Return a list of possible value for id
  return {
    paths: [
      { params: { type: 'day' } },
      { params: { type: 'week' } },
      { params: { type: 'month' } },
    ],
    fallback: false,
  };
}

export function getStaticProps(context) {
  return {
    props: {
      type: context.params.type,
    },
  };
}
