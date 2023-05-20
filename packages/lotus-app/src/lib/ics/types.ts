export type VEvent = {
  uid: string;
  summary?: string;
  start?: Date;
  end?: Date;
  /**
   * OPAQUE: The event or task blocks or obscures the availability of the calendar it belongs to. This is the default value if the TRANSP property is not specified.
   * TRANSPARENT: The event or task does not block or obscure the availability of the calendar it belongs to. Other events or tasks can be scheduled during this time.
   */
  transp?: 'OPAQUE' | 'TRANSPARENT';
  /**
   * PUBLIC: The event is public, and its information is intended to be widely available.
   * PRIVATE: The event is private, and its information should be kept confidential.
   * CONFIDENTIAL: The event is confidential, and its information should be kept highly confidential.
   */
  class?: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL';

  /**
   * 0-9
   * 0 = low priority
   * 9 = high priority
   */
  priority?: number;

  /**
   * TENTATIVE: The event is tentative, and its details may change.
   * CONFIRMED: The event is confirmed, and its details are final.
   * CANCELLED: The event has been cancelled and should no longer be considered.
   * NEEDS-ACTION: The event requires action from the calendar user, such as accepting or declining the invitation.
   * COMPLETED: The event has been completed.
   * IN-PROCESS: The event is currently in progress.
   * DRAFT: The event is a draft, and its details may change.
   */
  status?:
    | 'TENTATIVE'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'NEEDS-ACTION'
    | 'COMPLETED'
    | 'IN-PROCESS'
    | 'DRAFT';
  /**
   * Version of the event
   * Update of the event should increase sequence
   */
  sequence?: number;

  /**
   * X-MICROSOFT-CDO-BUSYSTATUS
   * FREE: The user is free during the time of the event or task.
   * TENTATIVE: The user is tentatively busy during the time of the event or task.
   * BUSY: The user is busy during the time of the event or task.
   * OOF: The user is out of the office during the time of the event or task.
   */
  busyStatus?: 'FREE' | 'TENTATIVE' | 'BUSY' | 'OOF';
  /**
   * X-MICROSOFT-CDO-INTENDEDSTATUS
   * FREE: The user is free during the time of the event or task.
   * TENTATIVE: The user is tentatively busy during the time of the event or task.
   * BUSY: The user is busy during the time of the event or task.
   * OOF: The user is out of the office during the time of the event or task.
   */
  intendedBusyStatus?: 'FREE' | 'TENTATIVE' | 'BUSY' | 'OOF';

  /**
   * X-MICROSOFT-CDO-IMPORTANCE
   * 1: Low importance.
   * 2: Normal importance.
   * 3: High importance.
   */
  importance?: 1 | 2 | 3;

  /**
   * X-MICROSOFT-CDO-INSTTYPE
   * type of recurrance event
   * 0: This is the master instance of a recurring event or task.
   * 1: This is an occurrence of a recurring event or task.
   * 2: This is an exception to a recurring event or task.
   * 3: This is a recurrence of a recurring task that has been completed.
   */
  instanceType?: 0 | 1 | 2 | 3;

  /**
   * X-MICROSOFT-DONOTFORWARDMEETING
   */
  doNotForwardMeetingUpdate?: boolean;
  /**
   * X-MICROSOFT-DISALLOW-COUNTER
   * indicate whether a meeting request or update should not be counted as a response to the meeting
   */
  disallowCounter?: boolean;

  /**
   * X-MICROSOFT-CDO-APPT-SEQUENCE
   */
  apptSequence?: number;

  /**
   * X-MICROSOFT-CDO-ALLDAYEVENT
   */
  isAllDay?: boolean;

  created_at?: Date;
};

export type VTimezoneLocal = {
  start: Date;
  tzOffsetFrom: string;
  tzOffsetTo: string;
  rrule: {
    freq: 'YEARLY';
    byMonth: string;
    byDay: string;
  };
};
export type VTimezone = {
  id: string;
  standard: VTimezoneLocal;
  daylight: VTimezoneLocal;
};

export type VCalendar = {
  method: string;
  prodID: string;
  name?: string;
  version?: string;

  tz: VTimezone;

  events?: VEvent[];
};
