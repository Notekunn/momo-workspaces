import { createHash, createCipheriv, createDecipheriv, publicEncrypt, constants } from 'crypto'
import { CheckSumPayload, HistoryMapperResponse, TransactionDetailResponse } from './interface'
import moment, { Moment } from 'moment'
import { MomoMessage, MomoTransfer } from './enum'
import { appConfig } from './app'
import { ServiceData } from './types'
import { serviceDataMapping } from './constants'

export function getAuthHeader(phoneNumber: string, authToken: string, requestEncryptKey: string) {
  const aesKey = getRandomKey(32)
  const requestKey = encodeRSA(aesKey, requestEncryptKey)

  const headers = {
    // 'Content-Type': 'application/json',
    Host: 'owa.momo.vn',
    // Connection: 'Keep-Alive',
    // 'User-Agent': 'MoMoPlatform-Release/30143 CFNetwork/1220.1 Darwin/20.3.0',
    userid: phoneNumber,
    authorization: `Bearer ${authToken}`,
    user_phone: phoneNumber,
    aes_key: aesKey,
    requestkey: requestKey,
  }
  return [aesKey, headers] as const
}

export function getDefaultForm(phoneNumber: string) {
  const timestamp = new Date().getTime()
  return {
    ...appConfig,
    cmdId: `${timestamp}000000`,
    time: timestamp,
    result: true,
    errorCode: 0,
    errorDesc: '',
    user: phoneNumber,
  } as const
}

export function getDefaultHeader() {
  const { appVer, appCode, deviceOS, lang } = appConfig
  return {
    app_version: appVer,
    app_code: appCode,
    device_os: deviceOS,
    lang,
    'Content-Type': 'application/json',
    Host: 'api.momo.vn',
    Connection: 'Keep-Alive',
    'User-Agent': 'MoMoPlatform-Release/30143 CFNetwork/1220.1 Darwin/20.3.0',
  } as const
}

export function getDefaultDevice(phoneNumber: string, imei: string) {
  return {
    number: phoneNumber,
    imei,
    cname: 'Vietnam',
    ccode: '084',
    device: 'iPhone 13',
    firmware: '15.5.1',
    hardware: 'iPhone',
    manufacture: 'Apple',
    csp: 'Viettel',
    icc: '',
    mcc: '452',
    device_os: 'IOS',
  }
}

export function momoErrorHandler(response: any) {
  console.log(response)
  return response.errorCode ? response.errorDesc : undefined
}

export function hashMd5(plainText: string): string {
  return createHash('md5').update(plainText).digest('hex')
}

export function hashSHA(plainText: string): string {
  return createHash('sha256').update(plainText).digest('hex')
}

export function getRandomKey(len: number): string {
  let rKey = ''
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charactersLength = characters.length
  for (let i = 0; i < len; i++) {
    rKey += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return rKey
}

export function getRandomImei() {
  const timeMd5 = hashMd5(`${new Date().getTime()}`)
  const parts = [
    [0, 8],
    [8, 12],
    [12, 16],
    [16, 20],
    [17, 29],
  ]

  const imei = parts.map((sliceData) => timeMd5.slice(...sliceData)).join('-')
  return imei
}

export function getRandomOneSignal() {
  const currentTime = new Date().getTime()
  const time = currentTime + Math.floor(currentTime / 1000)
  const timeMd5 = hashMd5(`${time}`)
  const parts = [
    [0, 8],
    [8, 12],
    [12, 16],
    [16, 20],
    [17, 29],
  ]

  const imei = parts.map((sliceData) => timeMd5.slice(...sliceData)).join('-')
  return imei
}

export function nomalizeSecret(secret: string, size = 32): string {
  return secret.padEnd(size, 'x').slice(0, 32)
}

export function encryptAES(plainText: string, secret: string): string {
  const iv = Buffer.from(new Uint16Array(16))
  const encryptor = createCipheriv('AES-256-CBC', nomalizeSecret(secret), iv)
  return encryptor.update(plainText, 'utf8', 'base64') + encryptor.final('base64')
}

export function decryptAES(cipherText: string, secret: string): string {
  const iv = Buffer.from(new Uint16Array(16))
  const decryptor = createDecipheriv('AES-256-CBC', nomalizeSecret(secret), iv)
  return decryptor.update(cipherText, 'base64', 'utf8') + decryptor.final('utf8')
}

export function encodeRSA(plainText: string, key: string) {
  const buffer = Buffer.from(plainText)
  return publicEncrypt(
    {
      key,
      padding: constants.RSA_PKCS1_PADDING,
    },
    buffer,
  ).toString('base64')
}

export function generateCheckSum(payload: CheckSumPayload, timestamp: number, msgType: MomoMessage) {
  const { phoneNumber, setupKey, ohash } = payload

  const plainText = `${phoneNumber}${timestamp}000000${msgType}${(timestamp / 1e12).toFixed(12)}E12`

  const encryptKey = decryptAES(setupKey, ohash)

  const checkSum = encryptAES(plainText, encryptKey)

  return checkSum
}

export function getTransCheckSum(payload: CheckSumPayload, timestamp: string, msg: MomoMessage) {
  const { phoneNumber, setupKey, ohash } = payload
  const checkSumPlainText = `${phoneNumber}${timestamp}000000${msg}${timestamp.slice(0, 1)}.${timestamp.slice(1)}E12`
  console.log(checkSumPlainText)

  const checksumKey = decryptAES(setupKey, ohash)
  const checksum = encryptAES(checkSumPlainText, checksumKey)

  return checksum
}

export type PHashPayload = Record<'imei' | 'password' | 'setupKey' | 'ohash', string>

export function getPHash({ imei, password, setupKey, ohash }: PHashPayload) {
  const pHashPlainText = `${imei}|${password}`
  const pHashKey = decryptAES(setupKey, ohash)

  const pHash = encryptAES(pHashPlainText, pHashKey)

  return pHash
}

export function historyMapper(rawData: any): HistoryMapperResponse {
  const {
    transId,
    serviceId,
    sourceId,
    sourceName,
    targetId,
    targetName,
    io,
    lastUpdate,
    createdAt,
    transhisData,
    postBalance = 0,
    totalAmount = 0,
  } = rawData

  return {
    transId,
    serviceId,
    source: {
      id: sourceId,
      name: sourceName,
    },
    target: {
      id: targetId,
      name: targetName,
    },
    transferType: io === 1 ? MomoTransfer.IN : io === -1 ? MomoTransfer.OUT : MomoTransfer.UNKNOWN,
    createdAt,
    lastUpdate,
    transhisData,
    postBalance,
    totalAmount,
  }
}

export function normalizeDate(dateOrString: string | Date): Moment {
  const date = moment(dateOrString, typeof dateOrString === 'string' ? 'DD/MM/YYYY' : undefined)

  return date
}

export function parseServiceData(data: string): ServiceData {
  try {
    const jsonObject = JSON.parse(data)
    const serviceData: ServiceData = {}
    for (const serviceDataKey in serviceDataMapping) {
      const key = <keyof ServiceData>serviceDataKey
      const value = serviceDataMapping[key]
      serviceData[key] = jsonObject[value] || ''
    }
    return serviceData
  } catch (error) {
    return {}
  }
}

export function transactionDetailMapper(momoMsg: any): TransactionDetailResponse {
  const {
    transId,
    serviceId = 'transfer_p2p',
    sourceId,
    sourceName,
    targetId,
    targetName,
    io,
    lastUpdate,
    createdAt,
    transhisData,
    postBalance = 0,
    totalAmount = 0,
  } = momoMsg

  const serviceData = parseServiceData(momoMsg.serviceData)

  return {
    transId,
    serviceId,
    source: {
      id: sourceId,
      name: sourceName,
    },
    target: {
      id: targetId,
      name: targetName,
    },
    transferType: io === 1 ? MomoTransfer.IN : io === -1 ? MomoTransfer.OUT : MomoTransfer.UNKNOWN,
    createdAt,
    lastUpdate,
    transhisData,
    postBalance,
    totalAmount,
    ...serviceData,
  }
}
