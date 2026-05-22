const APP_TIME_ZONE = "Europe/Berlin"

function partsFor(date: Date, timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

function offsetMsAt(instant: Date, timeZone = APP_TIME_ZONE) {
  const parts = partsFor(instant, timeZone)
  const zonedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  )

  return zonedAsUtc - instant.getTime()
}

export function localDateKey(date: Date | string, timeZone = APP_TIME_ZONE) {
  const parts = partsFor(typeof date === "string" ? new Date(date) : date, timeZone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function todayDateKey(timeZone = APP_TIME_ZONE) {
  return localDateKey(new Date(), timeZone)
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0))
  return date.toISOString().slice(0, 10)
}

export function dateKeyToIso(dateKey: string, time = "00:00") {
  const [year, month, day] = dateKey.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0)
  const firstGuess = new Date(naiveUtc - offsetMsAt(new Date(naiveUtc)))
  const corrected = new Date(naiveUtc - offsetMsAt(firstGuess))

  return corrected.toISOString()
}

export function dateKeyRangeToIso(dateKey: string) {
  return {
    start: dateKeyToIso(dateKey, "00:00"),
    end: dateKeyToIso(dateKey, "23:59"),
  }
}

export function formatLocalTime(iso: string, timeZone = APP_TIME_ZONE) {
  return new Date(iso).toLocaleTimeString("de-DE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  })
}
