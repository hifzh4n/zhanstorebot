export interface SmsProvider {
  requestNumber(params: {
    serviceName: string;
    country: "malaysia";
    orderId: string;
  }): Promise<{
    success: boolean;
    smsOrderId?: string;
    phoneNumber?: string;
    errorMessage?: string;
  }>;

  getOtp(params: {
    smsOrderId: string;
    orderId: string;
  }): Promise<{
    success: boolean;
    otpCode?: string;
    isReady: boolean;
    errorMessage?: string;
  }>;
}
