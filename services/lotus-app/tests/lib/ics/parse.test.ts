import { parseIcs } from '@/lib/ics/parse';
import { readFile } from 'fs/promises';

describe('ics', () => {
  describe('parse', () => {
    it('should raw parse basic vcalendar', () => {
      const res = parseIcs(`BEGIN:VCALENDAR\r
METHOD:PUBLISH\r
PRODID:Microsoft Exchange Server 2010\r
VERSION:2.0\r
X-WR-CALNAME:Calendrier\r
TEST:HELLOWORLD\r
BEGIN:HELLO\r
NAME:TEST\r
END:HELLO\r
END:VCALENDAR\r
`);
      expect(res).toEqual({
        method: 'PUBLISH',
        prodID: 'Microsoft Exchange Server 2010',
        version: '2.0',
        name: 'Calendrier',
        TEST: { params: {}, value: 'HELLOWORLD' },
        HELLO: [{ NAME: { params: {}, value: 'TEST' } }],
      });
    });

    it('should parse', async () => {
      const ics = parseIcs(
        `BEGIN:VCALENDAR\r
METHOD:PUBLISH\r
PRODID:Microsoft Exchange Server 2010\r
VERSION:2.0\r
X-WR-CALNAME:Calendrier\r
BEGIN:VTIMEZONE\r
TZID:Romance Standard Time\r
BEGIN:STANDARD\r
DTSTART:16010101T030000\r
TZOFFSETFROM:+0200\r
TZOFFSETTO:+0100\r
RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=10\r
END:STANDARD\r
BEGIN:DAYLIGHT\r
DTSTART:16010101T020000\r
TZOFFSETFROM:+0100\r
TZOFFSETTO:+0200\r
RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=3\r
END:DAYLIGHT\r
END:VTIMEZONE\r
BEGIN:VEVENT\r
UID:010000009900E00074C5B8202A82E00800000000122AFE740F2FD901000000000000000
 0100000000B4B9E97E38427438E51261074928FF\r
SUMMARY:Disponible\r
DTSTART;VALUE=DATE:20230125\r
DTEND;VALUE=DATE:20230126\r
CLASS:PUBLIC\r
PRIORITY:5\r
DTSTAMP:20230425T102839Z\r
TRANSP:TRANSPARENT\r
STATUS:CONFIRMED\r
X-MICROSOFT-CDO-BUSYSTATUS:FREE\r
X-MICROSOFT-CDO-INTENDEDSTATUS:BUSY\r
X-MICROSOFT-CDO-ALLDAYEVENT:TRUE\r
X-MICROSOFT-CDO-IMPORTANCE:1\r
X-MICROSOFT-CDO-INSTTYPE:0\r
X-MICROSOFT-DONOTFORWARDMEETING:FALSE\r
X-MICROSOFT-DISALLOW-COUNTER:FALSE\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:040000008200E00074C5B7101A82E008000000002CA2244FF933A901000000000000000
 010000000530DB4405B1E634CA1930BDDF15BF8F5\r
SUMMARY:Disponible\r
DTSTART;VALUE=DATE:20230201\r
DTEND;VALUE=DATE:20230202\r
CLASS:PUBLIC\r
PRIORITY:5\r
DTSTAMP:20230425T102839Z\r
TRANSP:TRANSPARENT\r
STATUS:CONFIRMED\r
X-MICROSOFT-CDO-BUSYSTATUS:FREE\r
X-MICROSOFT-CDO-INTENDEDSTATUS:BUSY\r
X-MICROSOFT-CDO-ALLDAYEVENT:TRUE\r
X-MICROSOFT-CDO-IMPORTANCE:1\r
X-MICROSOFT-CDO-INSTTYPE:0\r
X-MICROSOFT-DONOTFORWARDMEETING:FALSE\r
X-MICROSOFT-DISALLOW-COUNTER:FALSE\r
END:VEVENT\r
END:VCALENDAR
`.trim()
      );
      expect(ics).toEqual({
        method: 'PUBLISH',
        prodID: 'Microsoft Exchange Server 2010',
        version: '2.0',
        name: 'Calendrier',
        tz: {
          id: 'Romance Standard Time',
          standard: [
            {
              start: new Date('1601-01-01T02:50:39.000Z'),
              tzOffsetFrom: '+0200',
              tzOffsetTo: '+0100',
              rrule: {
                freq: 'YEARLY',
                byMonth: '10',
                byDay: '-1SU',
              },
            },
          ],
          daylight: [
            {
              start: new Date('1601-01-01T01:50:39.000Z'),
              tzOffsetFrom: '+0100',
              tzOffsetTo: '+0200',
              rrule: {
                freq: 'YEARLY',
                byMonth: '3',
                byDay: '-1SU',
              },
            },
          ],
        },
        events: [
          {
            uid: '010000009900E00074C5B8202A82E00800000000122AFE740F2FD901000000000000000\n 0100000000B4B9E97E38427438E51261074928FF',
            summary: 'Disponible',
            start: new Date('2023-01-24T23:00:00.000Z'),
            end: new Date('2023-01-25T23:00:00.000Z'),
            class: 'PUBLIC',
            priority: 5,
            created_at: new Date('2023-04-25T08:28:39.000Z'),
            transp: 'TRANSPARENT',
            status: 'CONFIRMED',
            busyStatus: 'FREE',
            intendedBusyStatus: 'BUSY',
            isAllDay: true,
            importance: 0,
            doNotForwardMeetingUpdate: false,
            disallowCounter: false,
          },
          {
            uid: '040000008200E00074C5B7101A82E008000000002CA2244FF933A901000000000000000\n 010000000530DB4405B1E634CA1930BDDF15BF8F5',
            summary: 'Disponible',
            start: new Date('2023-01-31T23:00:00.000Z'),
            end: new Date('2023-02-01T23:00:00.000Z'),
            class: 'PUBLIC',
            priority: 5,
            created_at: new Date('2023-04-25T08:28:39.000Z'),
            transp: 'TRANSPARENT',
            status: 'CONFIRMED',
            busyStatus: 'FREE',
            intendedBusyStatus: 'BUSY',
            isAllDay: true,
            importance: 0,
            doNotForwardMeetingUpdate: false,
            disallowCounter: false,
          },
        ],
      });
    });
  });
});
