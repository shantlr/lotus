export type CalendarType = 'day' | 'week' | 'month';

export type OnCreateTask = (value: {
  elem?: HTMLElement;
  title?: string;
  start?: Date;
  end?: Date;
}) => void;
