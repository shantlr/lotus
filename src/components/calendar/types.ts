export type OnCreateTask = (value: {
  elem?: HTMLElement;
  title?: string;
  start?: Date;
  end?: Date;
}) => void;
