export interface MicrosoftCalendarGroup {
  id: string;
  name: string;
  classId: string;
  changeKey: string;
}

export interface MicrosoftCalendar {
  id: string;
  name: string;
  color?: 'auto' | string;
  hexColor?: string;

  isDefaultCalendar?: boolean;
  changeKey?: string;
  canShare?: boolean;
  canViewPrivateItems?: boolean;
  canEdit?: boolean;
  allowedOnlineMeetingProviders?: string[];
  allowedOnlineMeetingProvider?: string;
  defaultOnlineMeetingProvider?: boolean;
  isTallyingResponses?: boolean;
  isRemovable?: boolean;

  owner?: {
    name: string;
    address: string;
  };
}

export interface MicrosoftCalendarEvent {
  '@odata.etag'?: string;
  id: string;
  iCalUId?: string;

  createdDateTime?: string;
  lastModifiedDateTime?: string;

  changeKey?: string;
  categories?: null[] | null;
  transactionId?: string;
  originalStartTimeZone?: string;
  originalEndTimeZone?: string;
  reminderMinutesBeforeStart?: number;
  isReminderOn?: boolean;
  hasAttachments?: boolean;
  subject?: string;
  bodyPreview?: string;
  importance?: string;
  sensitivity?: string;
  isAllDay?: boolean;
  isCancelled?: boolean;
  isOrganizer?: boolean;
  responseRequested?: boolean;
  seriesMasterId?: null;
  showAs?: string;
  type?: string;
  webLink?: string;
  onlineMeetingUrl?: null;
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: string;
  allowNewTimeProposals?: boolean;
  occurrenceId?: null;
  isDraft?: boolean;
  hideAttendees?: boolean;
  responseStatus?: {
    response: string;
    time: string;
  };
  body?: {
    contentType: string;
    content: string;
  };
  start?: {
    dateTime: string;
    timeZone?: string;
  };
  end?: {
    dateTime: string;
    timeZone?: string;
  };
  location?: {
    displayName: string;
    locationType: string;
    uniqueIdType: string;
    address: object;
    coordinates: object;
  };
  locations?: null[] | null;
  recurrence?: null;
  attendees?: null[] | null;
  organizer?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  onlineMeeting?: null;
  'calendar@odata.associationLink'?: string;
  'calendar@odata.navigationLink'?: string;
}
