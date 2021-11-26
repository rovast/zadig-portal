export const parseJwt = (token) => {
  const base64Code = token.split('.')[1]
  return JSON.parse(decodeURIComponent(escape(window.atob(base64Code))))
}
