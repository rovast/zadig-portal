import { decode } from 'js-base64'
export const parseJwt = (token) => {
  const base64Code = token.split('.')[1]
  return JSON.parse(decode(base64Code))
}
