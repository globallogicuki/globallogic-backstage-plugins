import { meterColor } from './styles';

describe('meterColor', () => {
  it('ramps from red at none passing to green at all passing', () => {
    expect(meterColor(10, 10)).toBe('hsl(0, 62%, 45%)');
    expect(meterColor(5, 10)).toBe('hsl(60, 62%, 45%)');
    expect(meterColor(0, 10)).toBe('hsl(120, 62%, 45%)');
  });

  it('grades between the extremes rather than bucketing', () => {
    expect(meterColor(1, 10)).not.toBe(meterColor(9, 10));
  });

  it('leaves an unscored meter to the theme', () => {
    expect(meterColor(0, 0)).toBeNull();
  });
});
