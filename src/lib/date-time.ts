export const APP_TIME_ZONE = "Europe/Berlin"

type DateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value)
}

function getParts(date: Date, timeZone = APP_TIME_ZONE): DateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  }
}

function getTimeZoneOffsetMs(date: Date, timeZone = APP_TIME_ZONE) {
  const parts = getParts(date, timeZone)
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return localAsUtc - date.getTime()
}

export function formatDateKeyInTimeZone(value: string | Date, timeZone = APP_TIME_ZONE) {
  const parts = getParts(toDate(value), timeZone)
  return [
    parts.year,
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-")
}

export function formatTimeInTimeZone(value: string | Date, timeZone = APP_TIME_ZONE) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(toDate(value))
}

export function getMinutesInTimeZone(value: string | Date, timeZone = APP_TIME_ZONE) {
  const parts = getParts(toDate(value), timeZone)
  return parts.hour * 60 + parts.minute
}

export function localDateTimeToUtcIso(dateKey: string, time: string, timeZone = APP_TIME_ZONE) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const [hour = 0, minute = 0, second = 0] = time.split(":").map(Number)
  const wantedLocalAsUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  let utc = wantedLocalAsUtc

  for (let i = 0; i < 3; i += 1) {
    utc = wantedLocalAsUtc - getTimeZoneOffsetMs(new Date(utc), timeZone)
  }

  return new Date(utc).toISOString()
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0))
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-")
}

export function weekdayFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay()
}
