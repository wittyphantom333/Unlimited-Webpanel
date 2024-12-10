export const querystring = params => {
  return Object.keys(params)
    .map(key => {
      return key + '=' + encodeURIComponent(params[key])
    })
    .join('&')
}
