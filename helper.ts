import { TimeSpecificType, TimeWeeklyType } from './data'
import { isBefore, addMinutes, parse, addDays } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

export function parseCourseString(courseString: string) {
  const hyphenIndex = courseString.indexOf('-')
  const code = courseString.substring(0, hyphenIndex).trim()

  const creditStart = courseString.lastIndexOf('(')
  const creditEnd = courseString.lastIndexOf(')')
  const creditString = courseString.substring(creditStart + 1, creditEnd).trim()
  const credit = parseInt(creditString)

  const name = courseString.substring(hyphenIndex + 1, creditStart).trim()

  return {
    code: code,
    credit: credit,
    name: name
  }
}

export const parseDateTime = (dateString: string) => {
  const hktTimezone = 'Asia/Hong_Kong'

  if (dateString.includes('<br>')) {
    // specific time
    const SPECIFIC_DATES: TimeSpecificType[] = []
    const datetime = dateString.split('<br>')
    datetime.length > 2 && console.error('unexpected date format')
    const duration = datetime[0]
    const startDate = zonedTimeToUtc(
      parse(duration.split(' - ')[0], 'dd-MMM-yyyy', new Date()),
      hktTimezone
    )
    const endDate = zonedTimeToUtc(
      addMinutes(parse(duration.split(' - ')[1], 'dd-MMM-yyyy', new Date()), 1),
      hktTimezone
    )

    // first index of number
    const startDateIndex = datetime[1].indexOf(' ')
    const WEEKLY_DATES: number[] = []
    const days = datetime[1].substring(0, startDateIndex)
    const time = datetime[1].substring(startDateIndex + 1)

    days.length % 2 !== 0 && console.error('unexpected days format')
    for (let i = 0; i < days.length; i += 2) {
      const day = days[i] + days[i + 1]
      switch (day) {
        case 'Sa':
          WEEKLY_DATES.push(6)
          break
        case 'Su':
          WEEKLY_DATES.push(0)
          break
        case 'Mo':
          WEEKLY_DATES.push(1)
          break
        case 'Tu':
          WEEKLY_DATES.push(2)
          break
        case 'We':
          WEEKLY_DATES.push(3)
          break
        case 'Th':
          WEEKLY_DATES.push(4)
          break
        case 'Fr':
          WEEKLY_DATES.push(5)
          break
      }
    }

    for (const day of WEEKLY_DATES) {
      let referenceDate = addDays(startDate, (day - startDate.getDay() + 7) % 7)
      while (isBefore(referenceDate, endDate)) {
        SPECIFIC_DATES.push({ date: referenceDate, time: time })
        referenceDate = addDays(referenceDate, 7)
      }
    }

    return SPECIFIC_DATES
  } else {
    // weekly
    const startDateIndex = dateString.indexOf(' ')
    const WEEKLY_DATES: TimeWeeklyType[] = []
    const days = dateString.substring(0, startDateIndex)
    const time = dateString.substring(startDateIndex + 1)
    for (let i = 0; i < days.length; i += 2) {
      const day = days[i] + days[i + 1]
      switch (day) {
        case 'Sa':
          WEEKLY_DATES.push({ day: 'sat', time: time })
          break
        case 'Su':
          WEEKLY_DATES.push({ day: 'sun', time: time })
          break
        case 'Mo':
          WEEKLY_DATES.push({ day: 'mon', time: time })
          break
        case 'Tu':
          WEEKLY_DATES.push({ day: 'tue', time: time })
          break
        case 'We':
          WEEKLY_DATES.push({ day: 'wed', time: time })
          break
        case 'Th':
          WEEKLY_DATES.push({ day: 'thu', time: time })
          break
        case 'Fr':
          WEEKLY_DATES.push({ day: 'fri', time: time })
          break
      }
    }

    return WEEKLY_DATES
  }
}
