import axios from 'axios'

import { appConfig, historyAppConfig } from './app'
import { MomoAPIEndpoint, MomoMessage, MomoMessageClass } from './enum'
import { sendEncryptedData } from './http'
import {
  BrowseHistoryPayload,
  ConfirmOTPPayload,
  ConfirmOTPResponse,
  ConfirmTransactionPayload,
  ConfirmTransactionResponse,
  FindReceiverProfilePayload,
  FindReceiverProfileResponse,
  HistoryMapperResponse,
  InitTransactionPayload,
  InitTransactionResponse,
  LoginPayload,
  LoginResponse,
  TransactionDetailPayload,
  TransactionDetailResponse,
} from './interface'
import {
  generateCheckSum,
  getDefaultDevice,
  getDefaultForm,
  getDefaultHeader,
  getPHash,
  hashSHA,
  historyMapper,
  momoErrorHandler,
  nomalizeDate,
  transactionDetailMapper,
} from './utils'

const api = axios.create({})

export interface RequestOTPPayload {
  phoneNumber: string
  imei: string
  rKey: string
  oneSignal: string
}

export async function requestOTP({ phoneNumber, imei, oneSignal, rKey }: RequestOTPPayload) {
  const form = getDefaultForm(phoneNumber)
  const bodySend = {
    ...form,
    msgType: MomoMessage.SEND_OTP,
    momoMsg: {
      _class: MomoMessageClass.SEND_OTP,
      ...getDefaultDevice(phoneNumber, imei),
    },
    extra: {
      action: 'SEND',
      rkey: rKey,
      AAID: oneSignal,
      IDFA: '',
      TOKEN: '',
      SIMULATOR: 'false',
      isVoice: true,
      checkSum: '',
    },
  }

  const headers = {
    ...getDefaultHeader(),
    msgtype: MomoMessage.SEND_OTP,
  }

  const { data } = await api.request({
    method: 'POST',
    url: MomoAPIEndpoint.SEND_OTP,
    headers,
    data: bodySend,
  })

  const error = momoErrorHandler(data)

  if (error) {
    throw new Error(error)
  }

  return data.resultType === 'SUCCESS'
}

export async function confirmOTP({
  phoneNumber,
  imei,
  rKey,
  oneSignal,
  otp,
}: ConfirmOTPPayload): Promise<ConfirmOTPResponse> {
  const oHash = hashSHA(`${phoneNumber}${rKey}${otp}`)
  const bodySend = {
    ...getDefaultForm(phoneNumber),
    msgType: MomoMessage.CONFIRM_OTP,
    momoMsg: {
      _class: MomoMessageClass.CONFIRM_OTP,
      ...getDefaultDevice(phoneNumber, imei),
    },
    extra: {
      ohash: oHash,
      AAID: oneSignal,
      IDFA: '',
      TOKEN: '',
      SIMULATOR: 'false',
      checkSum: '',
    },
  }

  const headers = {
    ...getDefaultHeader(),
    msgtype: MomoMessage.CONFIRM_OTP,
  }

  const { data } = await api.request({
    method: 'POST',
    url: MomoAPIEndpoint.CONFIRM_OTP,
    headers,
    data: bodySend,
  })

  const error = momoErrorHandler(data)

  if (error) {
    throw new Error(error)
  }
  const {
    extra: { ohash, setupKey },
  } = data

  return {
    ohash,
    setupKey,
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { password, phoneNumber, ohash, setupKey, imei, oneSignal } = payload

  const pHash = getPHash({ imei, password, setupKey, ohash })
  const checkSum = generateCheckSum({ ohash, phoneNumber, setupKey }, new Date().getTime(), MomoMessage.USER_LOGIN)

  const bodySend = {
    ...getDefaultForm(phoneNumber),
    pass: password,
    msgType: MomoMessage.USER_LOGIN,
    momoMsg: {
      _class: MomoMessageClass.USER_LOGIN,
      isSetup: true,
    },
    extra: {
      pHash,
      checkSum,
      AAID: oneSignal,
      IDFA: '',
      TOKEN: '',
      SIMULATOR: 'false',
    },
  }

  const headers = {
    ...getDefaultHeader(),
    msgtype: MomoMessage.USER_LOGIN,
  }

  const { data } = await api.request({
    method: 'POST',
    url: MomoAPIEndpoint.USER_LOGIN,
    headers,
    data: bodySend,
  })

  const error = momoErrorHandler(data)

  if (error) {
    throw new Error(error)
  }

  const {
    extra: { AUTH_TOKEN, REQUEST_ENCRYPT_KEY, REFRESH_TOKEN },
  } = data

  return {
    authToken: AUTH_TOKEN,
    requestEncryptKey: REQUEST_ENCRYPT_KEY,
    refreshToken: REFRESH_TOKEN,
    pHash,
    checkSum,
  }
}

export async function browseHistory(payload: BrowseHistoryPayload) {
  const { startDate, endDate, page = 1, limit = 10 } = payload
  const start = nomalizeDate(startDate)
  const end = nomalizeDate(endDate)
  if (end.isBefore(start)) {
    throw new Error('startDate must before endDate')
  }

  const requestId = Math.floor(new Date().getTime() / 1000)

  const bodySend = {
    requestId,
    startDate: start.format('DD/MM/YYYY'),
    endDate: end.format('DD/MM/YYYY'),
    offset: (page - 1) * limit,
    limit,
    ...appConfig,
    ...historyAppConfig,
  }
  const jsonData = await sendEncryptedData(
    {
      data: bodySend,
      method: 'POST',
      url: MomoAPIEndpoint.BROWSE_HISTORY,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    payload,
  )

  const { momoMsg, totalItems, currentLimit, listOver } = jsonData

  const historyData: HistoryMapperResponse[] = momoMsg.map(historyMapper)

  return {
    totalItems,
    currentLimit,
    listOver,
    historyData,
  }
}

export async function transactionDetail(payload: TransactionDetailPayload): Promise<TransactionDetailResponse> {
  const { transId, serviceId } = payload
  const requestId = Math.floor(new Date().getTime() / 1000)

  const bodySend = {
    requestId,
    transId,
    serviceId,
    ...appConfig,
    ...historyAppConfig,
  }

  const jsonData = await sendEncryptedData(
    {
      data: bodySend,
      method: 'POST',
      url: MomoAPIEndpoint.TRANS_DETAIL,
      headers: {},
    },
    payload,
  )

  return transactionDetailMapper(jsonData.momoMsg)
}

export async function findReceiverProfile(payload: FindReceiverProfilePayload): Promise<FindReceiverProfileResponse> {
  const { phoneNumber, targetUserId } = payload

  const defaultForm = getDefaultForm(phoneNumber)

  const checkSum = generateCheckSum(payload, new Date().getTime(), MomoMessage.FIND_RECEIVER_PROFILE)
  const bodySend = {
    ...defaultForm,
    msgType: MomoMessage.FIND_RECEIVER_PROFILE,
    momoMsg: {
      callerId: 'FE_transfer_p2p',
      targetUserId,
      _class: MomoMessageClass.FIND_RECEIVER_PROFILE,
    },
    extra: {
      checkSum,
    },
  }

  const headers = {
    ...getDefaultHeader(),
    'Content-Type': false,
    msgtype: MomoMessage.FIND_RECEIVER_PROFILE,
  }
  const data = await sendEncryptedData(
    {
      data: bodySend,
      headers,
      url: MomoAPIEndpoint.FIND_RECEIVER_PROFILE,
      method: 'POST',
    },
    payload,
  )

  const {
    momoMsg: { receiverProfile },
  } = data

  return receiverProfile
}

export async function initTransaction(payload: InitTransactionPayload): Promise<InitTransactionResponse> {
  const { phoneNumber, amount, partner, comment = '' } = payload

  const bodySend = {
    msgType: MomoMessage.TRANS_INIT,
    ...getDefaultForm(phoneNumber),
    momoMsg: {
      clientTime: new Date().getTime(),
      tranType: 2018,
      comment,
      amount,
      partnerId: partner.id,
      partnerName: partner.name,
      ref: '',
      serviceCode: 'transfer_p2p',
      serviceId: 'transfer_p2p',
      _class: MomoMessageClass.TRANS_INIT,
      tranList: [
        {
          partnerName: partner.name,
          partnerId: partner.id,
          originalAmount: amount,
          serviceCode: 'transfer_p2p',
          themeUrl: 'https://cdn.mservice.com.vn/app/img/transfer/theme/Muasam-750x260.png',
          receiverType: 1,
          _class: MomoMessageClass.TRANS_INIT,
          tranType: 2018,
          comment,
          moneySource: 1,
          partnerCode: 'momo',
          serviceMode: 'transfer_p2p',
          serviceId: 'transfer_p2p',
        },
      ],
      moneySource: 1,
      partnerCode: 'momo',
    },
    extra: {
      checkSum: generateCheckSum(payload, new Date().getTime(), MomoMessage.TRANS_INIT),
    },
  }

  const headers = {
    accept: 'application/json',
    msgtype: MomoMessage.TRANS_INIT,
  }

  const jsonData = await sendEncryptedData(
    {
      method: 'POST',
      url: MomoAPIEndpoint.TRANS_INIT,
      headers,
      data: bodySend,
    },
    payload,
  )

  const {
    momoMsg: { replyMsgs },
  } = jsonData

  if (replyMsgs.length === 0) {
    throw new Error('Cannot init transaction')
  }

  const {
    id: transactionId,
    tranHisMsg: { amount: _amount, partnerId, partnerName },
  } = replyMsgs[0]

  return {
    transactionId,
    partnerId,
    partnerName,
    amount: _amount,
  }
}

export async function sendMoney(payload: ConfirmTransactionPayload): Promise<ConfirmTransactionResponse> {
  const { amount, phoneNumber, pass } = payload
  const { transactionId, partnerId, partnerName } = await initTransaction(payload)
  const bodySend = {
    ...getDefaultForm(phoneNumber),
    msgType: MomoMessage.TRANS_CONFIRM,
    pass,
    momoMsg: {
      _class: MomoMessageClass.TRANS_CONFIRM,
      tranType: 2018,
      quantity: 1,
      idFirstReplyMsg: transactionId,
      moneySource: 1,
      cbAmount: 0,
      ids: [transactionId],
      amount,
      originalAmount: amount,
      cashInAmount: amount,
      tranHisMsgs: [
        {
          ID: transactionId,
          user: phoneNumber,
          serviceMode: 'transfer_p2p',
          originalAmount: amount,
          serviceId: 'transfer_p2p',
          quantity: 1,
          receiverType: 1,
          sourceToken: 'SOF-1',
          _class: 'mservice.backend.entity.msg.TranHisMsg',
        },
      ],
    },
    extra: {
      checkSum: generateCheckSum(payload, new Date().getTime(), MomoMessage.TRANS_CONFIRM),
    },
  }

  const headers = {
    accept: 'application/json',
    msgtype: MomoMessage.TRANS_CONFIRM,
  }

  const jsonData = await sendEncryptedData(
    {
      method: 'POST',
      url: MomoAPIEndpoint.TRANS_CONFIRM,
      headers,
      data: bodySend,
    },
    payload,
  )

  const {
    extra: { BALANCE },
  } = jsonData

  return {
    balance: +BALANCE || 0,
    amount,
    partnerId,
    partnerName,
  }
}
