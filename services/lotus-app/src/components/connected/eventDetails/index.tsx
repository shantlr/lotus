import { useMemo } from 'react';
import { Button } from '../../base/button';
import { FaTimes, FaTrash } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useMutation, useQuery } from 'urql';
import {
  DELETE_EVENT_MUTATION,
  GET_CAL_EVENT_DETAIL_QUERY,
  UPDATE_EVENT_MUTATION,
} from './query';
import { IconButton } from '../../base/iconButton';
import { useOnBlurChange } from '../../base/hooks/useOnBlurChange';
import { DateRangePicker } from '../../base/dateRangePicker';
import clsx from 'clsx';
import { SelectLabels } from '../selectEventLabels';

export const CalendarEventDetails = ({
  eventId,
  onClose,
}: {
  eventId: string;
  onClose?: () => void;
}) => {
  const [{ data }] = useQuery({
    query: GET_CAL_EVENT_DETAIL_QUERY,
    variables: {
      id: eventId,
    },
  });

  const event = data?.calendarEvent;

  const formattedDate = useMemo(() => {
    if (!event?.end || !event?.start) {
      return '';
    }

    const start = dayjs(event.start);
    const end = dayjs(event.end);

    if (start.format('DD/MM/YYYY') === end.format('DD/MM/YYYY')) {
      return `${start.format('DD/MM/YYYY')} ${dayjs(event.start).format(
        'HH:mm'
      )} - ${end.format('HH:mm')}`;
    }

    if (start.format('MM/YYYY') === end.format('MM/YYYY')) {
      return ``;
    }

    if (start.format('YYYY') === end.format('YYYY')) {
      return `${start.format('DD/MM HH:mm')} - ${end.format(
        'DD/MM/YYYY HH:mm'
      )}`;
    }

    return `${start.format('DD/MM/YYYY HH:mm')} - ${end.format(
      'DD/MM/YYYY HH:mm'
    )}`;
  }, [event?.end, event?.start]);

  const [{ fetching: deleting }, deleteEvent] = useMutation(
    DELETE_EVENT_MUTATION
  );
  const [{}, updateEvent] = useMutation(UPDATE_EVENT_MUTATION);
  const title = useOnBlurChange(
    event?.title,
    (val) => {
      if (val && event) {
        updateEvent({ input: { id: event.id, title: val } });
      }
    },
    { blurOnEnter: true, escapeCancel: true }
  );

  const labelIds = useMemo(
    () => event?.labels.map((l) => l.id),
    [event?.labels]
  );

  if (!event) {
    return null;
  }

  return (
    <div className="min-w-[200px] bg-white rounded p-2 text-slate-500">
      <div className="flex items-center justify-center">
        <input className="px-2 m-auto flex-grow outline-none" {...title} />
        {onClose && (
          <IconButton
            className="ml-2 mr-2"
            icon={FaTimes}
            onClick={() => onClose()}
          />
        )}
      </div>

      <DateRangePicker
        className="mt-2 mr-2"
        start={event.start}
        end={event.end}
        onChange={(range) => {
          updateEvent({
            input: { id: event.id, startDate: range.start, endDate: range.end },
          });
        }}
      >
        {({ className, show, setShow }) => (
          <div
            className={clsx(
              'px-2 text-sm text-slate-400 select-none transition rounded border-2 hover:border-highlight-light cursor-pointer',
              {
                'border-transparent': !show,
                'border-highlight': show,
              },
              className
            )}
            onClick={() => {
              setShow(!show);
            }}
          >
            {formattedDate}
          </div>
        )}
      </DateRangePicker>

      <SelectLabels
        className="mt-2 w-full"
        size="sm"
        value={labelIds}
        onChange={(nextLabelIds) => {
          if (!nextLabelIds.length) {
            return;
          }
          updateEvent({
            input: {
              id: event.id,
              labelIds: nextLabelIds,
            },
          });
        }}
      />

      <div className="px-2 pt-4">
        <Button
          t="danger"
          className="py-2 px-8"
          loading={deleting}
          onClick={() => {
            deleteEvent({
              input: {
                id: event.id,
              },
            });
          }}
        >
          <FaTrash className="text-sm" />
        </Button>
      </div>
    </div>
  );
};
