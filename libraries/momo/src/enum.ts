/* eslint-disable no-unused-vars */

export enum MomoMessage {
  SEND_OTP = 'SEND_OTP_MSG',
  CONFIRM_OTP = 'REG_DEVICE_MSG',
  USER_LOGIN = 'USER_LOGIN_MSG',
  TRANS_INIT = 'M2MU_INIT',
  TRANS_CONFIRM = 'M2MU_CONFIRM',
  FIND_RECEIVER_PROFILE = 'FIND_RECEIVER_PROFILE',
}

export enum MomoMessageClass {
  SEND_OTP = 'mservice.backend.entity.msg.RegDeviceMsg',
  CONFIRM_OTP = 'mservice.backend.entity.msg.RegDeviceMsg',
  USER_LOGIN = 'mservice.backend.entity.msg.LoginMsg',
  TRANS_INIT = 'mservice.backend.entity.msg.M2MUInitMsg',
  TRANS_CONFIRM = 'mservice.backend.entity.msg.M2MUConfirmMsg',
  FIND_RECEIVER_PROFILE = 'mservice.backend.entity.msg.ForwardMsg',
}

export enum MomoAPIEndpoint {
  SEND_OTP = 'https://api.momo.vn/backend/otp-app/public/SEND_OTP_MSG',
  CONFIRM_OTP = 'https://api.momo.vn/backend/otp-app/public/REG_DEVICE_MSG',
  USER_LOGIN = 'https://owa.momo.vn/public/login',
  BROWSE_HISTORY = 'https://api.momo.vn/sync/transhis/browse',
  TRANS_DETAIL = 'https://api.momo.vn/sync/transhis/details',
  FIND_RECEIVER_PROFILE = 'https://owa.momo.vn/api/FIND_RECEIVER_PROFILE',
  TRANS_INIT = 'https://owa.momo.vn/api/M2MU_INIT',
  TRANS_CONFIRM = 'https://owa.momo.vn/api/M2MU_CONFIRM',
}

export enum MomoTransfer {
  IN = 'in',
  OUT = 'out',
  UNKNOWN = 'unknown',
}
