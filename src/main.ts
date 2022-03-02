import * as core from '@actions/core'
import {cloneDeep, keyBy, merge, values} from 'lodash'

type ObjectArray = Record<string, unknown>[]

async function run(): Promise<void> {
  const source = core.getInput('source_json')
  const input = core.getInput('input_json')
  const filterProperty = core.getInput('filter_property')

  try {
    const sourceJson = JSON.parse(source)
    const inputJson = JSON.parse(input)

    if (Array.isArray(sourceJson)) {
      if (filterProperty) {
        // Are all of the elements in the source array objects/
        if (!isObjectArray(sourceJson))
          return core.setFailed(
            `"filterProperty" was specified, but not all elements satisfy the type 'object'`
          )

        // Do all of the objects in the source array share [filterProperty]
        // as a common property?
        const propertiesEqual = sourceJson.every(
          object => filterProperty in object
        )
        if (!propertiesEqual)
          return core.setFailed(
            `Not all objects in the source array contain the key "${filterProperty}"`
          )

        // Does the input object have [filterProperty] as a valid key/value?
        const inputObjectHasProp = inputJson[filterProperty] !== undefined
        if (!inputObjectHasProp)
          return core.setFailed(
            `Input object does not contain the key "${filterProperty}"`
          )

        const output = values(
          merge(
            keyBy(sourceJson, filterProperty),
            keyBy([inputJson], filterProperty)
          )
        )

        return core.setOutput('json', output)
      } else {
        const outputArray = cloneDeep(sourceJson)
        outputArray.push(inputJson)
        return core.setOutput('json', outputArray)
      }
    } else if (typeof sourceJson === 'object') {
      if (typeof inputJson !== 'object')
        return core.setFailed(
          'input_json must be an object if source_json is an object'
        )
      return core.setOutput('json', {...sourceJson, ...inputJson})
    }
    return core.setFailed('source_json should be a valid JSON array or object')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }

  core.debug(new Date().toTimeString())
  core.debug(new Date().toTimeString())

  core.setOutput('time', new Date().toTimeString())
}

function isObjectArray(array: unknown[]): array is ObjectArray {
  return array.every(object => typeof object === 'object')
}

run()
