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

test('create recurring task', t => {
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

test('rejects', t => {
  const invalid = /Invalid/
  const illegal = /Illegal Property/
  const required = /Required Property/
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
  t.throws(create(), invalid)
  t.throws(create({ status: 'invalid' }), invalid)
  t.throws(create({ ...pending }), required) // description
  t.throws(create({ ...pending, description: '\n' }), invalid)
  t.throws(create({ ...pending, description, due }), invalid)
  t.throws(create({ ...pending, description, start }), invalid)
  t.throws(create({ ...pending, description, until }), invalid)
  t.throws(create({ ...pending, description, scheduled }), invalid)
  t.throws(create({ ...pending, description, priority }), invalid)

  // pending
  t.throws(create({ ...pending, end }), illegal)
  t.throws(create({ ...pending, wait }), illegal)
  t.throws(create({ ...pending, recur }), illegal)
  t.throws(create({ ...pending, mask }), illegal)
  t.throws(create({ ...pending, imask }), illegal)
  t.throws(create({ ...pending, parent }), illegal)

  // deleted
  t.throws(create({ status: 'deleted' }), /Nothing to do/)

  // completed
  t.throws(create({ ...completed }), required) // end
  t.throws(create({ ...completed, end }), invalid)
  t.throws(create({ ...completed, wait }), illegal)
  t.throws(create({ ...completed, recur }), illegal)
  t.throws(create({ ...completed, mask }), illegal)
  t.throws(create({ ...completed, imask }), illegal)
  t.throws(create({ ...completed, parent }), illegal)

  // waiting
  t.throws(create({ ...waiting }), required) // wait
  t.throws(create({ ...waiting, wait }), invalid)
  t.throws(create({ ...waiting, end }), illegal)
  t.throws(create({ ...waiting, recur }), illegal)
  t.throws(create({ ...waiting, mask }), illegal)
  t.throws(create({ ...waiting, imask }), illegal)
  t.throws(create({ ...waiting, parent }), illegal)

  // recurring
  t.throws(create({ ...recurring, end }), illegal)
  t.throws(create({ ...recurring, wait }), illegal)
  t.throws(create({ ...recurring, parent, mask }), illegal)
  t.throws(create({ ...recurring, parent }), required) // imask
  t.throws(create({ ...recurring, parent, imask }), invalid)
  t.throws(create({ ...recurring, imask }), illegal)
  t.throws(create({ ...recurring }), required) // mask
  t.throws(create({ ...recurring, mask }), invalid)
  t.throws(create({ ...recurring, mask: '-' }), required) // recur
  t.throws(create({ ...recurring, mask: '-', recur }), invalid)
  t.throws(create({ ...recurring, mask: '-', recur: 'weekly' }), required) // due
  t.throws(create({ ...recurring, mask: '-', recur: 'weekly', due }), invalid)
})
