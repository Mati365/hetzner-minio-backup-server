import { format } from './format';

export function formatTimestamp(str: string) {
  const date = new Date();
  const timestamp = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getSeconds(),
  ]
    .map(line => line.toString().padStart(2, '0'))
    .join('');

  return format(str, {
    timestamp,
  });
}
