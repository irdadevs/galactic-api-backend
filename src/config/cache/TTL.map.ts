export const TTL_MAP: Record<string, number> = {
  oneMinute: 60, // 60 seconds
  fiveMinutes: 5 * 60, // 300 seconds
  tenMinutes: 10 * 60, // 600 seconds
  fifteenMinutes: 15 * 60, // 900 seconds
  thirtyMinutes: 30 * 60, // 1800 seconds
  oneHour: 60 * 60, // 3600 seconds
  twoHours: 2 * 60 * 60, // 7200 seconds
  sixHours: 6 * 60 * 60, // 21600 seconds
  twelveHours: 12 * 60 * 60, // 43200 seconds
  oneDay: 24 * 60 * 60, // 86400 seconds
  threeDays: 3 * 24 * 60 * 60, // 259200 seconds
  oneWeek: 7 * 24 * 60 * 60, // 604800 seconds
  twoWeeks: 14 * 24 * 60 * 60, // 1209600 seconds
  oneMonth: 30 * 24 * 60 * 60, // 2592000 seconds (approx)
  threeMonths: 90 * 24 * 60 * 60, // 7776000 seconds
  sixMonths: 180 * 24 * 60 * 60, // 15552000 seconds
  oneYear: 365 * 24 * 60 * 60, // 31536000 seconds
};
