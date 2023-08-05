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
