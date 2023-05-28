export type CalendarType = 'day' | 'week' | 'month';

export type OnCreateEvent = (value: {
  elem?: HTMLElement;
  title?: string;
  start?: Date;
  end?: Date;
}) => void;
