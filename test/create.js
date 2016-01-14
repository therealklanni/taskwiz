import test from 'ava'
import moment from 'moment'
import { create } from '../dist/taskwiz'

const format = 'YYYYMMDDTHHmmss[Z]'
const isValidDate = dateString =>
  moment(dateString, format).format(format) === dateString

const verifyCoreProperties = (t, task) => {
  // UUID must exist
  t.ok(task.uuid, '`uuid` must be defined')

  // Description must exist and not contain newline characters
  t.ok(task.description, '`description` must be defined')
  t.ok(typeof task.description === 'string', '`description` must be a string')
  t.notOk((/\n/g).test(task.description), '`description` must not contain newline characters')

  // Entry must exist and be properly date formatted
  t.ok(isValidDate(task.entry), '`entry` must be a formatted date string')
}

test('create pending task', t => {
  const details = {
    status: 'pending',
    description: 'testing'
  }

  return create(details).then(result => {
    const {
      uuid,
      entry,
      ...rest
    } = result

    verifyCoreProperties(t, { uuid, entry, description: rest.description })

    t.notOk(rest.hasOwnProperty('end'), '`end` must not exist')
    t.notOk(rest.hasOwnProperty('wait'), '`wait` must not exist')
    t.notOk(rest.hasOwnProperty('recur'), '`recur` must not exist')
    t.notOk(rest.hasOwnProperty('mask'), '`mask` must not exist')
    t.notOk(rest.hasOwnProperty('imask'), '`imask` must not exist')
    t.notOk(rest.hasOwnProperty('parent'), '`parent` must not exist')

    // Verify non-generated provided properties were applied
    t.same(rest, details, 'Original properties must not be modified')
  })
})

test('create completed task', t => {
  const details = {
    status: 'completed',
    description: 'testing'
  }

  return create(details).then(result => {
    const {
      uuid,
      entry,
      end,
      ...rest
    } = result

    verifyCoreProperties(t, { uuid, entry, description: rest.description })

    t.notOk(rest.hasOwnProperty('wait'), '`wait` must not exist')
    t.notOk(rest.hasOwnProperty('recur'), '`recur` must not exist')
    t.notOk(rest.hasOwnProperty('mask'), '`mask` must not exist')
    t.notOk(rest.hasOwnProperty('imask'), '`imask` must not exist')
    t.notOk(rest.hasOwnProperty('parent'), '`parent` must not exist')
    t.ok(isValidDate(end), '`end` must be a formatted date string')

    // Verify non-generated provided properties were applied
    t.same(rest, details, 'Original properties must not be modified')
  })
})

test('create waiting task', t => {
  const details = {
    status: 'waiting',
    description: 'testing',
    wait: moment().format(format)
  }

  return create(details).then(result => {
    const {
      uuid,
      entry,
      ...rest
    } = result

    verifyCoreProperties(t, { uuid, entry, description: rest.description })

    // t.ok(isValidDate(rest.wait), '`wait` must be a formatted date string')
    t.notOk(rest.hasOwnProperty('recur'), '`recur` must not exist')
    t.notOk(rest.hasOwnProperty('mask'), '`mask` must not exist')
    t.notOk(rest.hasOwnProperty('imask'), '`imask` must not exist')
    t.notOk(rest.hasOwnProperty('parent'), '`parent` must not exist')

    // Verify non-generated provided properties were applied
    t.same(rest, details, 'Original properties must not be modified')
  })
})

test('create recurring parent task', t => {
  const details = {
    status: 'recurring',
    description: 'testing',
    due: moment().format(format),
    recur: 'monthly',
    mask: '----'
  }

  return create(details).then(result => {
    const {
      uuid,
      entry,
      ...rest
    } = result

    verifyCoreProperties(t, { uuid, entry, description: rest.description })

    t.notOk(rest.hasOwnProperty('end'), '`end` must not exist')
    t.notOk(rest.hasOwnProperty('wait'), '`wait` must not exist')

    // Verify non-generated provided properties were applied
    t.same(rest, details, 'Original properties must not be modified')
  })
})

test('create recurring child task', t => {
  const details = {
    status: 'recurring',
    description: 'testing',
    parent: 'uuid',
    recur: 'monthly',
    imask: 0
  }

  return create(details).then(result => {
    const {
      uuid,
      entry,
      ...rest
    } = result

    verifyCoreProperties(t, { uuid, entry, description: rest.description })

    t.notOk(rest.hasOwnProperty('end'), '`end` must not exist')
    t.notOk(rest.hasOwnProperty('wait'), '`wait` must not exist')

    // Verify non-generated provided properties were applied
    t.same(rest, details, 'Original properties must not be modified')
  })
})

test('rejects', t => {
  const invalid = x => new RegExp(`Invalid ${x}`)
  const illegal = x => new RegExp(`Illegal Property: ${x}`)
  const required = x => new RegExp(`Required Property: ${x}`)
  const date = moment().format(format)
  const description = 'test'
  const due = '19791224T245051'
  const [start, end, wait, until, scheduled] = [due, due, due, due, due]
  const recur = 'weakly'
  const mask = 'M'
  const imask = '0'
  const parent = 'abcd'
  const priority = 'A'
  const pending = { status: 'pending' }
  const completed = { status: 'completed' }
  const waiting = { status: 'waiting' }
  const recurring = { status: 'recurring' }

  // any status
  t.throws(create(), invalid('status'))
  t.throws(create({ status: 'invalid' }), invalid('status'))
  t.throws(create({ ...pending }), required('description'))
  t.throws(create({ ...pending, description: '\n' }), invalid('description'))
  t.throws(create({ ...pending, description, due }), invalid('due'))
  t.throws(create({ ...pending, description, start }), invalid('start'))
  t.throws(create({ ...pending, description, until }), invalid('until'))
  t.throws(create({ ...pending, description, scheduled }), invalid('scheduled'))
  t.throws(create({ ...pending, description, priority }), invalid('priority'))

  // pending
  t.throws(create({ ...pending, end }), illegal('end'))
  t.throws(create({ ...pending, wait }), illegal('wait'))
  t.throws(create({ ...pending, recur }), illegal('recur'))
  t.throws(create({ ...pending, mask }), illegal('mask'))
  t.throws(create({ ...pending, imask }), illegal('imask'))
  t.throws(create({ ...pending, parent }), illegal('parent'))

  // deleted
  t.throws(create({ status: 'deleted' }), /Nothing to do/)

  // completed
  t.throws(create({ ...completed, end }), invalid('end'))
  t.throws(create({ ...completed, wait }), illegal('wait'))
  t.throws(create({ ...completed, recur }), illegal('recur'))
  t.throws(create({ ...completed, mask }), illegal('mask'))
  t.throws(create({ ...completed, imask }), illegal('imask'))
  t.throws(create({ ...completed, parent }), illegal('parent'))

  // waiting
  t.throws(create({ ...waiting }), required('wait'))
  t.throws(create({ ...waiting, wait }), invalid('wait'))
  t.throws(create({ ...waiting, end }), illegal('end'))
  t.throws(create({ ...waiting, recur }), illegal('recur'))
  t.throws(create({ ...waiting, mask }), illegal('mask'))
  t.throws(create({ ...waiting, imask }), illegal('imask'))
  t.throws(create({ ...waiting, parent }), illegal('parent'))
  // t.throws(create({ ...waiting }), required('wait'))

  // recurring
  t.throws(create({ ...recurring, end }), illegal('end'))
  t.throws(create({ ...recurring, wait }), illegal('wait'))
  t.throws(create({ ...recurring, parent, mask }), illegal('mask'))
  t.throws(create({ ...recurring, parent }), required('imask'))
  t.throws(create({ ...recurring, parent, imask }), invalid('imask'))
  t.throws(create({ ...recurring, imask }), illegal('imask'))
  t.throws(create({ ...recurring }), required('mask'))
  t.throws(create({ ...recurring, mask }), invalid('mask'))
  t.throws(create({ ...recurring, mask: '-' }), required('due'))
  t.throws(create({ ...recurring, mask: '-', due }), invalid('due'))
  t.throws(create({ ...recurring, mask: '-', due: date }), required('recur'))
  t.throws(create({ ...recurring, mask: '-', due: date, recur }), invalid('recur'))
})
