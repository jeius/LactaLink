export function mergeDateTime(date: string | Date, time: string | Date): Date {
  const timeObj = new Date(time);
  const merged = new Date(date);
  merged.setHours(
    timeObj.getHours(),
    timeObj.getMinutes(),
    timeObj.getSeconds(),
    timeObj.getMilliseconds()
  );
  return merged;
}
