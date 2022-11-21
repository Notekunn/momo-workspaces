import {
  browseHistory,
  confirmOTP,
  findReceiverProfile,
  initTransaction,
  login,
  requestOTP,
  sendMoney,
  transactionDetail,
} from './api'
import { getRandomImei, getRandomKey, getRandomOneSignal } from './utils'

const imei = process.env.IMEI || getRandomImei()
const oneSignal = process.env.ONE_SIGNAL || getRandomOneSignal()
const rKey = process.env.R_KEY || getRandomKey(20)
const phoneNumber = process.env.PHONE || ''
const password = process.env.PASSWORD || ''
const setupKey = process.env.SETUP_KEY || ''
const ohash = process.env.OHASH || ''

const authToken = process.env.AUTH_TOKEN || ''
const requestEncryptKey = process.env.ENCRYPT_KEY?.replace(/\\n/g, '\n') || ''

describe('requestOTP()', () => {
  it('should return correct otp', async () => {
    const data = await requestOTP({
      phoneNumber,
      imei,
      rKey,
      oneSignal,
    })
    expect(data).toEqual(true)
  })
})

describe('confirmOTP()', () => {
  it('should accept otp', async () => {
    const data = await confirmOTP({
      phoneNumber,
      imei,
      rKey,
      oneSignal,
      otp: process.env.OTP || '000000',
    })
    expect(data).toBeDefined()
    expect(data.ohash).toBeDefined()
    expect(data.setupKey).toBeDefined()
  })
})

describe('login()', () => {
  it('should login success with correct pin', async () => {
    const data = await login({
      imei,
      ohash,
      oneSignal,
      password,
      setupKey,
      phoneNumber,
    })
    expect(data).toBeDefined()
    expect(data.authToken).toBeDefined()
    expect(data.requestEncryptKey).toBeDefined()
    console.log(data)
  })
})

describe('browseHistory()', () => {
  it('should return correct data', async () => {
    const data = await browseHistory({
      authToken,
      phoneNumber,
      requestEncryptKey,
      startDate: '01/10/2022',
      endDate: '21/11/2022',
      page: 1,
      limit: 10,
    })
    expect(data).toBeDefined()
    data.historyData.forEach((history) => {
      expect(history).toMatchSnapshot({
        transId: expect.any(Number),
        createdAt: expect.any(Number),
        lastUpdate: expect.any(Number),
        target: {
          id: expect.any(String),
          name: expect.any(String),
        },
        source: {
          id: expect.any(String),
          name: expect.any(String),
        },
        postBalance: expect.any(Number),
        totalAmount: expect.any(Number),
      })
    })
  }, 30000)
})

describe('transactionDetail()', () => {
  it('should show transaction detail', async () => {
    const { historyData } = await browseHistory({
      authToken,
      phoneNumber,
      requestEncryptKey,
      startDate: '01/10/2022',
      endDate: '21/11/2022',
      page: 1,
      limit: 10,
    })
    expect(historyData.length).toBeGreaterThan(0)
    const { transId } = historyData[0]
    const data = await transactionDetail({
      authToken,
      phoneNumber,
      requestEncryptKey,
      transId,
    })
    expect(data).toMatchSnapshot({
      transId: expect.any(Number),
      createdAt: expect.any(Number),
      lastUpdate: expect.any(Number),
      target: {
        id: expect.any(String),
        name: expect.any(String),
      },
      source: {
        id: expect.any(String),
        name: expect.any(String),
      },
      comment: expect.any(String),
      postBalance: expect.any(Number),
      totalAmount: expect.any(Number),
    })
  }, 10000)
})

describe('findReceiverProfile()', () => {
  it('should return receiver profile', async () => {
    const { name, agentId } = await findReceiverProfile({
      authToken,
      ohash,
      phoneNumber,
      requestEncryptKey,
      setupKey,
      targetUserId: '0911175581',
    })
    expect(name).toEqual(expect.any(String))
    expect(agentId).toEqual(expect.any(Number))
  })
})

describe('initTransaction()', () => {
  it('should init new transaction', async () => {
    const { amount, transactionId } = await initTransaction({
      partner: {
        name: 'Trần Đức Cường',
        id: '0911175581',
      },
      amount: 100,
      authToken,
      ohash,
      phoneNumber,
      requestEncryptKey,
      setupKey,
      comment: 'Alo',
    })
    expect(amount).toEqual(100)
    expect(transactionId).toBeDefined()
  }, 10000)
})

describe('sendMoney()', () => {
  it('should send money to account', async () => {
    const result = await sendMoney({
      partner: {
        name: '',
        id: '0329664058',
      },
      amount: 322,
      authToken,
      ohash,
      phoneNumber,
      requestEncryptKey,
      setupKey,
      comment: 'Hello world',
      pass: password,
    })
    expect(result).toEqual({
      amount: expect.any(Number),
      balance: expect.any(Number),
      partnerName: expect.any(String),
      partnerId: expect.any(String),
    })
  }, 30000)
})
