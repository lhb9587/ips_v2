import Cookies from 'js-cookie'

const TokenKey = 'IPSERVICE_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
    console.log(token,'token!!!');
  return Cookies.set(TokenKey, token,{  expires: 365
  })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}