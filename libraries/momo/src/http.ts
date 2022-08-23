import axios, { AxiosRequestConfig } from 'axios'
import { AuthPayload } from 'interface'

import { decryptAES, encryptAES, getAuthHeader, momoErrorHandler } from './utils'

export async function sendEncryptedData(config: AxiosRequestConfig, payload: AuthPayload) {
  const { authToken, phoneNumber, requestEncryptKey } = payload
  const [aesKey, authHeader] = getAuthHeader(phoneNumber, authToken, requestEncryptKey)
  const { data, headers } = config

  let encryptedData
  try {
    const { data: textData } = await axios.request({
      ...config,
      data: encryptAES(JSON.stringify(data), aesKey),
      headers: {
        ...authHeader,
        ...headers,
      },
    })
    encryptedData = textData
  } catch (error: any) {
    // TODO: Handler message
    throw new Error(error?.response?.data?.description || error.message)
  }
  if (typeof encryptedData === 'object') {
    const error = momoErrorHandler(encryptedData)
    if (error) {
      throw new Error(error)
    }
  }
  const plainText = decryptAES(encryptedData, aesKey)
  const jsonData = JSON.parse(plainText)

  const error = momoErrorHandler(jsonData)

  if (error) {
    throw new Error(error)
  }

  return jsonData
}
