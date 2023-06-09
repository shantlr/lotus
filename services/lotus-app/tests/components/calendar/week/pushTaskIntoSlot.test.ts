import { pushEventIntoSlots } from '@/components/connected/calendar/useEventsPosition';

describe('components', () => {
  describe('calendar', () => {
    describe('week', () => {
      describe('pushEventIntoSlots', () => {
        it('should push before slots', () => {
          const slots = [
            {
              top: 50,
              height: 100,
              events: [],
            },
          ];
          pushEventIntoSlots(slots, {
            top: 0,
            height: 50,
            usedSlots: [],
          });
          expect(slots).toMatchObject([
            {
              top: 0,
              height: 50,
            },
            {
              top: 50,
              height: 100,
            },
          ]);
        });

        it('should push after slots', () => {
          const slots = [
            {
              top: 0,
              height: 100,
              events: [],
            },
          ];
          pushEventIntoSlots(slots, {
            top: 100,
            height: 50,
            usedSlots: [],
          });
          expect(slots).toMatchObject([
            {
              top: 0,
              height: 100,
            },
            {
              top: 100,
              height: 50,
            },
          ]);
        });

        it('should split before slots', () => {
          const slots = [
            {
              top: 20,
              height: 80,
              events: [],
            },
          ];
          pushEventIntoSlots(slots, {
            top: 0,
            height: 50,
            usedSlots: [],
          });
          expect(slots).toMatchObject([
            {
              top: 0,
              height: 20,
            },
            {
              top: 20,
              height: 30,
            },
            {
              top: 50,
              height: 50,
            },
          ]);
        });
        it('should after before slots', () => {
          const slots = [
            {
              top: 0,
              height: 100,
              events: [],
            },
          ];
          pushEventIntoSlots(slots, {
            top: 50,
            height: 80,
            usedSlots: [],
          });
          expect(slots).toMatchObject([
            {
              top: 0,
              height: 50,
            },
            {
              top: 50,
              height: 50,
            },
            {
              top: 100,
              height: 30,
            },
          ]);
        });

        it('should split multiple slots', () => {
          const slots = [
            {
              top: 0,
              height: 100,
              events: [],
            },
            {
              top: 100,
              height: 50,
              events: [],
            },
          ];
          pushEventIntoSlots(slots, {
            top: 0,
            height: 130,
            usedSlots: [],
          });
          expect(slots).toMatchObject([
            {
              top: 0,
              height: 100,
            },
            {
              top: 100,
              height: 30,
            },
            {
              top: 130,
              height: 20,
            },
          ]);
        });
      });
    });
  });
});
