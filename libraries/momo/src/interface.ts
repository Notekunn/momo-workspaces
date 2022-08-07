import { MomoTransfer } from 'enum'

export type CheckSumPayload = Record<'phoneNumber' | 'setupKey' | 'ohash', string>
export interface ConfirmOTPPayload {
  phoneNumber: string
  imei: string
  rKey: string
  oneSignal: string
  otp: string
}

export interface ConfirmOTPResponse {
  ohash: string
  setupKey: string
}

export interface LoginPayload {
  password: string
  phoneNumber: string
  ohash: string
  setupKey: string
  imei: string
  oneSignal: string
}

export interface LoginResponse {
  authToken: string
  requestEncryptKey: string
  refreshToken: string
  checkSum: string
  pHash: string
}

export interface AuthPayload {
  requestEncryptKey: string
  phoneNumber: string
  authToken: string
}
export interface BrowseHistoryPayload extends AuthPayload {
  startDate: Date | string
  endDate: Date | string
  page?: number
  limit?: number
}

export interface HistoryMapperResponse {
  transId: number
  serviceId: string
  source: {
    id: string
    name: string
  }
  target: {
    id: string
    name: string
  }
  transferType: MomoTransfer
  createdAt: number
  lastUpdate: number
  totalAmount: number
  postBalance: number
  transhisData?: string
}

export interface TransactionDetailPayload extends AuthPayload {
  transId: number
  serviceId?: string
}

export interface TransactionDetailResponse extends HistoryMapperResponse {
  comment?: string
}

export interface FindReceiverProfilePayload extends AuthPayload, CheckSumPayload {
  targetUserId: string
}

export interface FindReceiverProfileResponse {
  userId: string
  agentId: number
  name: string
  mutualFriendsTotal: number
  avatarUrl: string
}

export interface InitTransactionPayload extends AuthPayload, CheckSumPayload {
  amount: number
  partner: {
    id: string
    name: string
  }
  comment?: string
}

export interface InitTransactionResponse {
  transactionId: string
  partnerId: string
  partnerName: string
  amount: number
}

export interface ConfirmTransactionPayload extends InitTransactionPayload {
  pass: string
}

export interface ConfirmTransactionResponse {
  balance: number
  partnerId: string
  partnerName: string
  amount: number
}
