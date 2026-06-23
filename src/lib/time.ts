// Utility: returns an ISO-8601 timestamp using the client local time and timezone offset
export const getLocalISO = (): string => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const YYYY = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const DD = pad(d.getDate())
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  const tz = -d.getTimezoneOffset()
  const sign = tz >= 0 ? '+' : '-'
  const tzH = pad(Math.floor(Math.abs(tz) / 60))
  const tzM = pad(Math.abs(tz) % 60)
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${sign}${tzH}:${tzM}`
}

export default getLocalISO
