import {it, expect} from '@jest/globals'
import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'

const np = process.execPath
const ip = path.join(__dirname, '..', 'lib', 'main.js')

it('should add object to array', () => {
  process.env['INPUT_SOURCE_JSON'] = '[ { "id": 1 }, { "id": 2 } ]'
  process.env['INPUT_INPUT_JSON'] = '{ "id": 3 }'

  const options: cp.ExecFileSyncOptions = {env: process.env}
  const output = cp.execFileSync(np, [ip], options).toString()
  const jsonOutput = JSON.parse(output.split('json::')[1])
  expect(jsonOutput).toStrictEqual([{id: 1}, {id: 2}, {id: 3}])
})

it('should fail when input_json is invalid JSON', () => {
  process.env['INPUT_SOURCE_JSON'] = '[ { "id": 1 }, { "id": 2 } ]'
  process.env['INPUT_INPUT_JSON'] = 'a'

  const options: cp.ExecFileSyncOptions = {env: process.env}
  try {
    cp.execFileSync(np, [ip], options).toString()
  } catch (err: any) {
    const errorOutput = err.stdout
      .toString()
      .split('\n')[0]
      .replace('::error::', '')
      .trim()
    expect(errorOutput).toStrictEqual(
      'Unexpected token a in JSON at position 0'
    )
  }
})

it('should update object in array when filter_property is supplied and value matches', () => {
  process.env['INPUT_SOURCE_JSON'] =
    '[ { "id": 1, "title": "Test 1" }, { "id": 2, "title": "Title 2" }, { "id": 3, "title": "Title 3" } ]'
  process.env['INPUT_INPUT_JSON'] = '{ "id": 2, "title": "Test Updated!" }'
  process.env['INPUT_FILTER_PROPERTY'] = 'id'

  const options: cp.ExecFileSyncOptions = {env: process.env}
  const output = cp.execFileSync(np, [ip], options).toString()
  const jsonOutput = JSON.parse(output.split('json::')[1])
  expect(jsonOutput).toStrictEqual([
    {id: 1, title: 'Test 1'},
    {id: 2, title: 'Test Updated!'},
    {id: 3, title: 'Title 3'}
  ])
})

it('should update merge source_json and input_json when both objects', () => {
  process.env['INPUT_SOURCE_JSON'] = '{ "id": 1, "title": "Test 1" }'
  process.env['INPUT_INPUT_JSON'] =
    '{ "id": 1, "title": "Test Updated!", "description": "New" }'
  process.env['INPUT_FILTER_PROPERTY'] = 'id'

  const options: cp.ExecFileSyncOptions = {env: process.env}
  const output = cp.execFileSync(np, [ip], options).toString()
  const jsonOutput = JSON.parse(output.split('json::')[1])
  expect(jsonOutput).toStrictEqual({
    id: 1,
    title: 'Test Updated!',
    description: 'New'
  })
})
