import { mapMicrosoftEventToLotusEvent } from '../../../src/handlers/syncExternalCalendar/syncMicrosoftCalendar';

describe('handler', () => {
  describe('sync external calendar', () => {
    describe('microsoft', () => {
      it('should map basic event to lotus event', () => {
        expect(
          mapMicrosoftEventToLotusEvent({
            id: '1',
            subject: 'event 1',
            body: {
              content: '',
              contentType: 'html',
            },
            start: {
              dateTime: '2023-05-29T10:00:00.000Z',
              timeZone: 'UTC',
            },
            end: {
              dateTime: '2023-05-29T11:00:00.000Z',
              timeZone: 'UTC',
            },
            createdDateTime: '2023-05-28T08:00:00.000Z',
            lastModifiedDateTime: '2023-05-28T10:00:00.000Z',
          })
        ).toEqual({
          title: 'event 1',
          external_id: '1',
          external: true,
          start: new Date('2023-05-29T10:00:00.000Z'),
          end: new Date('2023-05-29T11:00:00.000Z'),
          created_at: new Date('2023-05-28T08:00:00.000Z'),
          updated_at: new Date('2023-05-28T10:00:00.000Z'),
        });
      });
    });
  });
});
