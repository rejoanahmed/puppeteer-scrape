import puppeteer from 'puppeteer-core'
import { Page } from 'puppeteer-core'
import { CourseType, SectionType } from './data'
import { parseCourseString } from './helper'

const PAGE = 'https://w5.ab.ust.hk/wcq/cgi-bin/2310/'

;(async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      'ws://127.0.0.1:9222/devtools/browser/892741a5-58b6-48cc-9528-095d5482ac46'
  })

  let page: Page | null = null
  const pages = await browser.pages()

  // Find a page that matches the target URL
  for (const p of pages) {
    if (p.url().startsWith(PAGE)) {
      page = p
      break
    }
  }

  if (!page) {
    console.log('No matching page found. Creating a new page.')
    page = await browser.newPage()
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' })
  }

  // Define a function to extract the navigator URLs
  const extractNavigatorUrls = async () => {
    const navigatorSelector = '#navigator .depts a'
    const links = await page?.$$eval(navigatorSelector, (els) =>
      els.map((el) => el.href)
    )
    return links
  }

  try {
    // Get the navigator URLs
    const navigatorUrls = await extractNavigatorUrls()

    if (!navigatorUrls) {
      console.log('no navigation urls')
      return
    }

    let courses: CourseType[] = []

    //TODO: Loop through the navigator URLs
    for (let i = 0; i < 1; i++) {
      const department = navigatorUrls[i]
      const url = department
      if (!page.url().startsWith(url))
        await page.goto(url, { waitUntil: 'domcontentloaded' })

      const coursesHandle = await page.$$('#classes > .course')

      //TODO: Loop through the course list
      for (let i = 16; i < 17; i++) {
        const courseHandle = coursesHandle[i]
        let course: CourseType = {} as CourseType
        let sections: SectionType[] = []

        // // get the code, credit, name
        // const title = await courseHandle.$eval('h2', (el) => el.innerText)
        // const code_credit_name = parseCourseString(title)
        // course.code = code_credit_name.code
        // course.name = code_credit_name.name
        // course.credit = code_credit_name.credit

        // // get the description, exclusion, prerequisites and info
        // const courseInfoRows = await courseHandle.$$(
        //   '.courseinfo .popupdetail > table > tbody > tr'
        // )
        // let info: Record<string, string> = {}
        // for (const row of courseInfoRows) {
        //   try {
        //     const label = await row.$eval(
        //       'th',
        //       (el) => el.innerHTML.replace(/<br>/g, ' ') // replace all <br> with space
        //     )

        //     const value = await row.$eval('td', (el) => el.innerText)

        //     switch (label) {
        //       case 'DESCRIPTION':
        //         course.description = value
        //         break
        //       case 'PRE-REQUISITE':
        //         course.prerequisites = value.split(',')
        //         break
        //       case 'EXCLUSION':
        //         course.exclusion = value.split(',')
        //         break
        //       default:
        //         info[label] = value
        //       // You can add more cases for other labels if needed
        //     }
        //   } catch (e) {
        //     // Handle any errors that occur during evaluation
        //     console.error('Error:', e)
        //   }
        // }
        // course.info = info

        // get the sections
        const sectionRowsHandle = await courseHandle.$$(
          '.sections > tbody > tr:not(:first-child)'
        )

        let section: SectionType | null = null
        for (const rowHandle of sectionRowsHandle) {
          const isNewSection = await rowHandle.evaluate((el) =>
            el.classList.contains('newsect')
          )
          if (isNewSection) {
            section && sections.push(section)
            section = {} as SectionType

            section.code = await rowHandle.$eval(
              'td:nth-child(1)',
              (el) => el.innerText
            )
            const instructorHandle = await rowHandle.$('td:nth-child(4)')

            if (instructorHandle)
              section.instructor = await instructorHandle.$$eval('a', (els) =>
                els.map((el) => el.innerText)
              )

            section.remarks = await rowHandle.$eval(
              'td:last-child .popupdetail',
              (el) => el.textContent?.replace(/<br>/g, ' ')
            )
          } else {
          }
        }
        section && sections.push(section)

        console.log(sections)

        course.sections = sections
        courses.push(course)
        // }
      }
    }

    // console.log(courses)
  } catch (error) {
    console.log(error)
  }
  // finally {
  //   await browser.close()
  // }
})()
