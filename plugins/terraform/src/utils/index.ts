import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  parseISO,
} from 'date-fns';

export function formatTimeToWords(
  isoTime: string,
  opts?: { strict?: boolean },
) {
  const format = opts?.strict ? formatDistanceToNowStrict : formatDistanceToNow;
  const timeStr = format(parseISO(isoTime), {
    addSuffix: true,
  });

  return timeStr;
}
