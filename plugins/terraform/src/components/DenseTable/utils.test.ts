import { getColor } from './utils';
import { Theme } from '@material-ui/core/styles/createTheme';

describe('getColor', () => {
  const mockTheme = {
    palette: {
      success: {
        light: '#81c784',
      },
      info: {
        light: '#64b5f6',
        main: '#2196f3',
        dark: '#1976d2',
      },
      error: {
        light: '#e57373',
      },
      action: {
        selected: '#f5f5f5',
      },
    },
  } as Theme;

  describe('when the status is "applied"', () => {
    it('should return the success light color', () => {
      expect(getColor('applied', mockTheme)).toBe('#81c784');
    });
  });

  describe('when the status is "planned"', () => {
    it('should return the info main color', () => {
      expect(getColor('planned', mockTheme)).toBe('#2196f3');
    });
  });

  describe('when the status is "planned_and_finished"', () => {
    it('should return the info light color', () => {
      expect(getColor('planned_and_finished', mockTheme)).toBe('#64b5f6');
    });
  });

  describe('when the status is "errored"', () => {
    it('should return the error light color', () => {
      expect(getColor('errored', mockTheme)).toBe('#e57373');
    });
  });

  describe('when the status is any other value', () => {
    it('should return the action selected color', () => {
      expect(getColor('pending', mockTheme)).toBe('#f5f5f5');
      expect(getColor('rejected', mockTheme)).toBe('#f5f5f5');
      expect(getColor('processing', mockTheme)).toBe('#f5f5f5');
    });
  });
});
