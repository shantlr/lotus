import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { VCalendar } from './types';

dayjs.extend(customParseFormat);

type LineIterator = {
  get line(): number;
  get value(): string;
  next(): void;
  [Symbol.iterator]: () => Generator<string, void, void>;
};

const RFC_LINE_SEP = /\r\n/;

const parseParams = (params: string[]) =>
  params.reduce((acc, p) => {
    const [paramName, paramValue] = p.split('=');
    acc[paramName] = paramValue;
    return acc;
  }, {} as Record<string, string>);
const parseNameParams = (text: string, componentName: string) => {
  const [name, ...params] = text.split(';');
  const noParams = COMPONENTS_MAPPER[componentName]?.[name]?.noParams;
  // TODO: handle quoted param value
  return {
    name,
    params: !noParams ? parseParams(params) : null,
  };
};
const parseDate = (value: any, params: any) => {
  if (params?.VALUE === 'DATE') {
    return dayjs(value, 'YYYYMMDD').toDate();
  }
  return dayjs(value, 'YYYYMMDDTHHmmss[Z]').toDate();
};
const parseRrule = (value: any) => {
  const params = parseParams(value.split(';'));
  return {
    freq: params.FREQ,
    byMonth: params.BYMONTH,
    byDay: params.BYDAY,
  };
};

const POST_MAPPERS = Symbol('ics componnt post parser mapper');

const COMPONENTS_MAPPER: Record<
  string,
  {
    [POST_MAPPERS]?: ((res: Record<string, any>) => void)[];
  } & Record<
    string,
    {
      key?: string;
      /**
       * Params are not parsed and only value is resolved
       */
      noParams?: boolean;
      /**
       * Params are parsed but only value is resolved
       */
      onlyValue?: boolean;
      mapValue?: (value: any, params?: any) => any;
    }
  >
> = {
  VCALENDAR: {
    [POST_MAPPERS]: [
      (c) => {
        if (c.tz) {
          c.tz = c.tz[0];
        }
      },
    ],
    'X-WR-CALNAME': {
      key: 'name',
      noParams: true,
    },
    METHOD: {
      key: 'method',
      noParams: true,
    },
    PRODID: {
      key: 'prodID',
      noParams: true,
    },
    VERSION: {
      key: 'version',
      noParams: true,
    },
    VEVENT: {
      key: 'events',
    },
    VTIMEZONE: {
      key: 'tz',
    },
  },
  VEVENT: {
    PRIORITY: {
      key: 'priority',
      noParams: true,
      mapValue: (v) => Number(v),
    },
    STATUS: {
      key: 'status',
      noParams: true,
    },
    SUMMARY: {
      key: 'summary',
      noParams: true,
    },
    CLASS: {
      key: 'class',
      noParams: true,
    },
    UID: {
      key: 'uid',
      noParams: true,
    },
    SEQUENCE: {
      key: 'sequence',
      noParams: true,
      mapValue: (v) => Number(v),
    },
    DTSTART: {
      key: 'start',
      onlyValue: true,
      mapValue: parseDate,
    },
    DTEND: {
      key: 'end',
      onlyValue: true,
      mapValue: parseDate,
    },
    DTSTAMP: {
      key: 'created_at',
      onlyValue: true,
      mapValue: parseDate,
    },
    TRANSP: {
      key: 'transp',
      noParams: true,
    },
    'X-MICROSOFT-CDO-APPT-SEQUENCE': {
      key: 'apptSequence',
      noParams: true,
      mapValue: (v) => Number(v),
    },
    'X-MICROSOFT-CDO-BUSYSTATUS': {
      key: 'busyStatus',
      noParams: true,
    },
    'X-MICROSOFT-CDO-INTENDEDSTATUS': {
      key: 'intendedBusyStatus',
      noParams: true,
    },
    'X-MICROSOFT-CDO-ALLDAYEVENT': {
      key: 'isAllDay',
      noParams: true,
      mapValue: (v) => v === 'TRUE',
    },
    'X-MICROSOFT-CDO-IMPORTANCE': {
      key: 'importance',
      noParams: true,
      mapValue: (v) => Number(v),
    },
    'X-MICROSOFT-CDO-INSTTYPE': {
      key: 'importance',
      noParams: true,
      mapValue: (v) => Number(v),
    },
    'X-MICROSOFT-DONOTFORWARDMEETING': {
      key: 'doNotForwardMeetingUpdate',
      noParams: true,
      mapValue: (v) => v === 'TRUE',
    },
    'X-MICROSOFT-DISALLOW-COUNTER': {
      key: 'disallowCounter',
      noParams: true,
      mapValue: (v) => v === 'TRUE',
    },
  },
  VTIMEZONE: {
    TZID: {
      key: 'id',
      noParams: true,
    },
    DAYLIGHT: {
      key: 'daylight',
    },
    STANDARD: {
      key: 'standard',
    },
    'LAST-MODIFIED': {
      key: 'lastModified',
      onlyValue: true,
      mapValue: parseDate,
    },
    TZURL: {
      key: 'url',
      noParams: true,
    },
  },
  STANDARD: {
    DTSTART: {
      key: 'start',
      onlyValue: true,
      mapValue: parseDate,
    },
    TZNAME: {
      key: 'name',
      noParams: true,
    },
    TZOFFSETFROM: {
      key: 'tzOffsetFrom',
      noParams: true,
    },
    TZOFFSETTO: {
      key: 'tzOffsetTo',
      noParams: true,
    },
    RRULE: {
      key: 'rrule',
      noParams: true,
      mapValue: parseRrule,
    },
  },
  DAYLIGHT: {
    DTSTART: {
      key: 'start',
      onlyValue: true,
      mapValue: parseDate,
    },
    TZNAME: {
      key: 'name',
      noParams: true,
    },
    TZOFFSETFROM: {
      key: 'tzOffsetFrom',
      noParams: true,
    },
    TZOFFSETTO: {
      key: 'tzOffsetTo',
      noParams: true,
    },
    RRULE: {
      key: 'rrule',
      noParams: true,
      mapValue: parseRrule,
    },
  },
};

const computeLineValue = (lines: string[], idx: number) => {
  let v = lines[idx];
  let nextLine = idx + 1;
  while (nextLine < lines.length && lines[nextLine].startsWith(' ')) {
    v += lines[nextLine].slice(1);
    nextLine += 1;
  }
  return [v, nextLine] as const;
};

const lineIterator = (lines: string[], idx = 0): LineIterator => {
  let [value, lineEndIdx] = computeLineValue(lines, idx);
  return {
    get line() {
      return lineEndIdx - 1;
    },
    get value() {
      return value;
    },
    next() {
      const n = computeLineValue(lines, lineEndIdx);
      value = n[0];
      lineEndIdx = n[1];
    },
    [Symbol.iterator]: function* () {
      const it = lineIterator(lines, idx);
      while (it.value != null) {
        yield it.value;
        it.next();
      }
    },
  };
};

const parseComponent = (it: LineIterator, componentName: string) => {
  const res: Record<string, any> = {};

  const end = `END:${componentName}`;

  while (true) {
    const token = it.value;
    // const token = it.next();

    if (!token || token == null) {
      throw new Error(
        `Component '${componentName}' (line ${it.line}) end not found`
      );
    }

    if (token === end) {
      it.next();
      break;
    }
    const [prefix, value] = token.split(':');

    it.next();

    if (prefix === 'BEGIN') {
      const k = COMPONENTS_MAPPER[componentName]?.[value]?.key ?? value;
      if (!res[k]) {
        res[k] = [];
      }
      res[k].push(parseComponent(it, value));
    } else {
      const { name, params } = parseNameParams(prefix, componentName);
      const k = COMPONENTS_MAPPER[componentName]?.[name]?.key ?? name;
      const v =
        COMPONENTS_MAPPER[componentName]?.[name]?.mapValue?.(value, params) ??
        value;
      res[k] =
        params === null || COMPONENTS_MAPPER[componentName]?.[name]?.onlyValue
          ? v
          : {
              params,
              value: v,
            };
    }
  }

  const postMapper = COMPONENTS_MAPPER[componentName]?.[POST_MAPPERS];
  if (postMapper) {
    postMapper.forEach((m) => m(res));
    //
  }
  return res;
};

export const parseIcs = (text: string) => {
  const t = text.trim();
  const it = lineIterator(t.split(RFC_LINE_SEP));
  if (it.value !== 'BEGIN:VCALENDAR') {
    throw new Error(
      `ics not starting by BEGIN:VCALENDAR but with: '${it.value}'`
    );
  }

  it.next();
  return parseComponent(it, 'VCALENDAR') as VCalendar;
};
