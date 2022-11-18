import {
  decryptAES,
  encodeRSA,
  encryptAES,
  getRandomImei,
  getRandomOneSignal,
  hashSHA,
  normalizeDate,
  nomalizeSecret,
} from './utils'

describe('getRandomImei()', () => {
  it('should return random imei', () => {
    expect(getRandomImei()).toHaveLength(36)
  })
})

describe('getRandomOneSignal()', () => {
  it('should return random one signal', () => {
    expect(getRandomOneSignal()).toHaveLength(36)
  })
})

describe('hashSHA()', () => {
  it('should return sha256 hash', () => {
    expect(hashSHA('helloworld')).toEqual('936a185caaa266bb9cbe981e9e05cb78cd732b0b3280eb944412bb6f8f8f07af')
  })
})

describe('nomalizeSecret()', () => {
  it('size < 32', () => {
    expect(nomalizeSecret('secret')).toHaveLength(32)
    expect(nomalizeSecret('secret')).toEqual('secretxxxxxxxxxxxxxxxxxxxxxxxxxx')
  })

  it('size = 32', () => {
    expect(nomalizeSecret('ssecrettssecrettssecrettssecrett')).toHaveLength(32)
    expect(nomalizeSecret('ssecrettssecrettssecrettssecrett')).toEqual('ssecrettssecrettssecrettssecrett')
  })

  it('size > 32', () => {
    expect(nomalizeSecret('ssecrettssecrettssecrettssecrettt')).toHaveLength(32)
    expect(nomalizeSecret('ssecrettssecrettssecrettssecrettt')).toEqual('ssecrettssecrettssecrettssecrett')
  })
})

describe('encrypt()', () => {
  it('should return encrypted hash', () => {
    expect(encryptAES('hello world', '2132')).toEqual('SLGfCkJC1DLm05DBIvC7Vg==')
  })
})

describe('decryptAES()', () => {
  it('should return correct plain text', () => {
    const plainText = 'hello'.repeat(100)
    const secret = 'super_secret'
    const cipherText = encryptAES(plainText, secret)
    expect(decryptAES(cipherText, secret)).toEqual(plainText)
  })
})

describe('encodeRSA()', () => {
  it('should return correct plain text', () => {
    expect(encodeRSA('ahihi', process.env.ENCRYPT_KEY?.replace(/\\n/g, '\n') || '')).toBeDefined()
  })
})

describe('nomalizeDate()', () => {
  it('nomalize Date', () => {
    expect(normalizeDate(new Date(2022, 11, 10)).toISOString()).toEqual('2022-12-09T17:00:00.000Z')
    expect(normalizeDate('05/08/2022').toISOString()).toEqual('2022-08-04T17:00:00.000Z')
  })
})

describe('getCheckSum()', () => {
  it('get check sum', () => {
    // const ohash = 'c279b4b1023d209d2c3b01b52ceb2a6ce4b8878a5e5e4660e64bfd29dae17f62'
    // const setupKey = 'czpYAqMKHcPk9WY10ge/NekdmHMWFoePI+b35vvWvVWOnaWgAJysOkabCget2wxH'
    // const checkSum = 'uGwcuWjmIXnWFhPlwUcG9lIyfYfT8aWz2EMuYC+9YgGiFJNrLjZLHR4cr9zY/iFv0xQtuOpjFu6cEJ7hAfUdPg=='
    // const checksumKey = decryptAES(setupKey, ohash)
    // const checkSumPlainText = decryptAES(checkSum, checksumKey)
    // console.log(checkSumPlainText)
  })
})
