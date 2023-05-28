import { classed } from '@/components/base/classed';
import { Popper } from '@/components/base/popper';
import { CalendarEventDetails } from '@/components/connected/eventDetails';
import { GetCalendarEventsQuery } from '@/gql/__generated/client/graphql';
import clsx from 'clsx';
import { ComponentProps, useState } from 'react';

const Base = classed(
  'div',
  'border-2 overflow-hidden event-item bg-gray-500 cursor-pointer hover:bg-gray-400 transition drop-shadow'
);

const BaseEventItem = ({
  eventId,
  ...props
}: {
  eventId: string;
} & ComponentProps<typeof Base>) => {
  const [show, setShow] = useState(false);

  return (
    <Popper
      show={show}
      options={{
        modifiers: [
          {
            name: 'offset',
            options: { offset: [0, 10] },
          },
        ],
      }}
      popper={
        <div className="shadow-xl z-50">
          <CalendarEventDetails
            eventId={eventId}
            onClose={() => setShow(false)}
          />
        </div>
      }
      onClose={setShow}
    >
      <Base
        onClick={(e) => {
          setShow(!show);
        }}
        {...props}
      />
    </Popper>
  );
};

export const CalendarEvent = ({
  event,
  className,
  ...props
}: {
  event: GetCalendarEventsQuery['calendarEvents'][number];
} & Omit<ComponentProps<typeof BaseEventItem>, 'eventId'>) => {
  return (
    <BaseEventItem
      eventId={event.id}
      {...props}
      style={{
        ...(props.style || null),
        background: event.color || undefined,
        borderColor: event.secondaryColor || undefined,
      }}
      className={clsx('rounded', className)}
    >
      {event.title}
    </BaseEventItem>
  );
};

export const AnchoredEventItem = ({
  className,
  event,
  ...props
}: {
  event: GetCalendarEventsQuery['calendarEvents'][number];
} & Omit<ComponentProps<typeof BaseEventItem>, 'eventId'>) => {
  return (
    <BaseEventItem
      eventId={event.id}
      className={clsx('text-xs rounded px-4 py-1', className)}
      {...props}
    >
      {event.title}
    </BaseEventItem>
  );
};
