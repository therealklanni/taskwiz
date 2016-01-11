export const durations = [
  'annual',
  'biannual',
  'bimonthly',
  'biweekly',
  'biyearly',
  'daily',
  'days',
  'day',
  'd',
  'fortnight',
  'hours',
  'hour',
  'hrs',
  'hr',
  'h',
  'minutes',
  'mins',
  'min',
  'monthly',
  'months',
  'month',
  'mnths',
  'mths',
  'mth',
  'mos',
  'mo',
  'quarterly',
  'quarters',
  'qrtrs',
  'qtrs',
  'qtr',
  'q',
  'seconds',
  'secs',
  'sec',
  's',
  'semiannual',
  'sennight',
  'weekdays',
  'weekly',
  'weeks',
  'week',
  'wks',
  'wk',
  'w',
  'yearly',
  'years',
  'year',
  'yrs',
  'yr',
  'y',
]

export const durationRegExp = new RegExp(`^([-]?\d)?(${durations.join('|')})$`)
export const maskRegExp = /^[-+XW]+$/
export const dateRegExp = /^(19[7-9]\d|[2-9]\d{3})(0[1-9]|1[0-2])([0-2]\d|3[01])T([01]\d|2[0-3])([0-5]\d){2}Z$/
export const priorityRegExp = /^(L|M|H)$/

export const validateDuration = duration => (durationRegExp).test(duration)
export const validateMask = mask => (maskRegExp).test(mask)
export const validateDate = date => (dateRegExp).test(date)
export const validatePriority = priority => (priorityRegExp).test(priority)
