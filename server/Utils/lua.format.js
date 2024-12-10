import {
  isNull,
  isBoolean,
  isNumber,
  isString,
  isArray,
  isObject,
  isEmpty,
  keys,
  repeat,
} from 'lodash'

const formatLuaString = (string, singleQuote) => {
  if (string[0] === '`' && string[string.length - 1] === '`')
    return `${string.replace(/'/g, "\\'")}`

  return singleQuote
    ? `'${string.replace(/'/g, "\\'")}'`
    : `"${string.replace(/"/g, '\\"')}"`
}

const valueKeys = { false: 'false', true: 'true', null: 'nil' }

const formatLuaKey = (string, singleQuote) =>
  valueKeys[string]
    ? `[${valueKeys[string]}]`
    : string.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)
    ? string
    : `[${formatLuaString(string, singleQuote)}]`

const format = (
  value,
  options = { eol: '\n', singleQuote: true, spaces: 2 }
) => {
  options = options || {}
  const eol = (options.eol = isString(options.eol) ? options.eol : '\n')
  options.singleQuote = isBoolean(options.singleQuote)
    ? options.singleQuote
    : true
  options.spaces =
    isNull(options.spaces) ||
    isNumber(options.spaces) ||
    isString(options.spaces)
      ? options.spaces
      : 2

  const rec = (value, i = 0) => {
    if (isNull(value)) {
      return 'nil'
    }
    if (isBoolean(value) || isNumber(value)) {
      return value.toString()
    }
    if (isString(value)) {
      return formatLuaString(value, options.singleQuote)
    }
    if (isArray(value)) {
      if (isEmpty(value)) {
        return '{}'
      }
      if (options.spaces) {
        const spaces = isNumber(options.spaces)
          ? repeat(' ', options.spaces * (i + 1))
          : repeat(options.spaces, i + 1)
        const spacesEnd = isNumber(options.spaces)
          ? repeat(' ', options.spaces * i)
          : repeat(options.spaces, i)
        return `{${eol}${value
          .map(e => `${spaces}${rec(e, i + 1)},`)
          .join(eol)}${eol}${spacesEnd}}`
      }
      return `{${value.map(e => `${rec(e, i + 1)},`).join('')}}`
    }
    if (isObject(value)) {
      if (isEmpty(value)) {
        return '{}'
      }
      if (options.spaces) {
        const spaces = isNumber(options.spaces)
          ? repeat(' ', options.spaces * (i + 1))
          : repeat(options.spaces, i + 1)
        const spacesEnd = isNumber(options.spaces)
          ? repeat(' ', options.spaces * i)
          : repeat(options.spaces, i)
        return `{${eol}${keys(value)
          .map(
            key =>
              `${spaces}${formatLuaKey(key, options.singleQuote)} = ${rec(
                value[key],
                i + 1
              )},`
          )
          .join(eol)}${eol}${spacesEnd}}`
      }
      return `{${keys(value)
        .map(
          key =>
            `${formatLuaKey(key, options.singleQuote)}=${rec(
              value[key],
              i + 1
            )},`
        )
        .join('')}}`
    }
    throw new Error(`can't format ${typeof value}`)
  }

  return `${options.spaces ? ' ' : ''}${rec(value)}`
}

export { format }
