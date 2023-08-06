import { z } from 'zod'

export const timeWeekly = z.object({
  day: z.enum(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']),
  time: z.string().min(17).max(17)
})

export const timeSpecific = z.object({
  date: z.date(),
  time: z.string().min(17).max(17)
})

export const specificTimeAndLocation = z.object({
  time: timeSpecific,
  location: z.string()
})

export const weeklyTimeAndLocation = z.object({
  time: timeWeekly,
  location: z.string()
})

export const Section = z.object({
  code: z.string().max(10),
  instructor: z.array(z.string()),
  timeAndLocation: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('specific'),
      data: z.array(specificTimeAndLocation)
    }),
    z.object({
      type: z.literal('weekly'),
      data: z.array(weeklyTimeAndLocation)
    })
  ]),
  remarks: z.string().optional()
})
export const Course = z.object({
  credit: z.number(),
  name: z.string(),
  code: z.string(),
  sections: z.array(Section),
  description: z.string(),
  exclusion: z.array(z.string()),
  prerequisites: z.array(z.string()),
  info: z.record(z.string())
})

export type CourseType = z.infer<typeof Course>

export type SectionType = z.infer<typeof Section>

export type TimeAndLocationType = z.infer<
  typeof specificTimeAndLocation | typeof weeklyTimeAndLocation
>

export type SpecificTimeAndLocationType = z.infer<
  typeof specificTimeAndLocation
>

export type WeeklyTimeAndLocationType = z.infer<typeof weeklyTimeAndLocation>

export type TimeWeeklyType = z.infer<typeof timeWeekly>

export type TimeSpecificType = z.infer<typeof timeSpecific>
