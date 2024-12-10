function clamp(value, max) {
  return Math.max(0, Math.min(max, value))
}

export function moveItemInArray(array, fromIndex, toIndex) {
  const from = clamp(fromIndex, array.length - 1)
  const to = clamp(toIndex, array.length - 1)

  if (from === to) {
    return
  }

  const target = array[from]
  const delta = to < from ? -1 : 1

  for (let i = from; i !== to; i += delta) {
    array[i] = array[i + delta]
  }

  array[to] = target
}
