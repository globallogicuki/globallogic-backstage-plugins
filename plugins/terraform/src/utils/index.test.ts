import { formatTimeToWords } from './index';

const isoString = '2023-05-24T10:23:40.172Z';

describe('utils', () => {
  describe('formatTimeToWords', () => {
    beforeEach(() => {
      const mockedDate = new Date(2023, 10, 12);

      jest.useFakeTimers();
      jest.setSystemTime(mockedDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('formats correctly with no opts', () => {
      const result = formatTimeToWords(isoString);

      expect(result).toEqual('6 months ago');
    });

    it('provides precise values if strict set', () => {
      const now = new Date().toISOString();
      const result = formatTimeToWords(now, { strict: true });

      expect(result).toEqual('0 seconds ago');
    });

    it('rounds values if strict not set', () => {
      const now = new Date().toISOString();
      const result = formatTimeToWords(now, { strict: false });

      expect(result).toEqual('less than a minute ago');
    });
  });
});
