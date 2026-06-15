import {SmsProvider} from "./sms-provider.interface";
import {getAppSettings} from "./settings.service";

export class MockSmsService implements SmsProvider {
  async requestNumber(params: {
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
  }> {
    const settings = await getAppSettings();
    return {
      success: true,
      smsOrderId: `MOCK-${params.orderId}`,
      phoneNumber: settings.mockPhoneNumber,
    };
  }

  async getOtp(): Promise<{
    success: boolean;
    otpCode?: string;
    isReady: boolean;
    errorMessage?: string;
  }> {
    const settings = await getAppSettings();
    return {
      success: true,
      otpCode: settings.mockOtp,
      isReady: true,
    };
  }
}
