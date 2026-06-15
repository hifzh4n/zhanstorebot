export interface SmsProvider {
  requestNumber(params: {
    serviceName: string;
    smsCodeCatalogProductId: number | null;
    smsCodeMaxPrice?: number | null;
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
