import {env} from "../config/env";
import {SmsProvider} from "./sms-provider.interface";

type SmsCodeEnvelope<T> =
  | {success: true; data: T}
  | {success: false; error?: {code?: string; message?: string}};

interface SmsCodeCreateResponse {
  orders?: Array<{
    id: number;
    status: string;
    phone_number?: string | null;
    failed_reason?: string | null;
  }>;
  failed_count?: number;
  failed_reason?: string | null;
}

interface SmsCodeOrderResponse {
  id: number;
  status: string;
  phone_number?: string | null;
  otp_code?: string | null;
  otp_message?: string | null;
  failed_reason?: string | null;
}

export class SmsCodeService implements SmsProvider {
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
    if (!env.smscodeApiToken) {
      return {
        success: false,
        errorMessage: "SMSCode API token is not configured.",
      };
    }
    if (!params.smsCodeCatalogProductId) {
      return {
        success: false,
        errorMessage: `SMSCode catalog product ID is missing for ${params.serviceName}.`,
      };
    }

    const body: Record<string, unknown> = {
      catalog_product_id: params.smsCodeCatalogProductId,
      quantity: 1,
      policy: "cheapest",
    };
    if (params.smsCodeMaxPrice) {
      body.max_price = params.smsCodeMaxPrice;
    }

    const result = await this.request<SmsCodeCreateResponse>(
      "/orders/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": params.orderId,
        },
        body: JSON.stringify(body),
      },
    );
    if (!result.success) {
      return result;
    }

    const order = result.data.orders?.[0];
    if (!order?.id || !order.phone_number) {
      return {
        success: false,
        errorMessage: order?.failed_reason ??
          result.data.failed_reason ??
          "SMSCode did not return a phone number.",
      };
    }
    return {
      success: true,
      smsOrderId: String(order.id),
      phoneNumber: order.phone_number,
    };
  }

  async getOtp(params: {
    smsOrderId: string;
    orderId: string;
  }): Promise<{
    success: boolean;
    otpCode?: string;
    isReady: boolean;
    errorMessage?: string;
  }> {
    if (!env.smscodeApiToken) {
      return {
        success: false,
        isReady: false,
        errorMessage: "SMSCode API token is not configured.",
      };
    }

    const result = await this.request<SmsCodeOrderResponse>(
      `/orders/${encodeURIComponent(params.smsOrderId)}`,
      {method: "GET"},
    );
    if (!result.success) {
      return {...result, isReady: false};
    }
    if (result.data.failed_reason) {
      return {
        success: false,
        isReady: false,
        errorMessage: result.data.failed_reason,
      };
    }
    if (result.data.otp_code) {
      return {
        success: true,
        isReady: true,
        otpCode: result.data.otp_code,
      };
    }
    return {
      success: true,
      isReady: false,
    };
  }

  private async request<T>(
    path: string,
    init: RequestInit,
  ): Promise<{success: true; data: T} | {success: false; errorMessage: string}> {
    const response = await fetch(`${env.smscodeBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${env.smscodeApiToken}`,
        ...(init.headers ?? {}),
      },
    });
    const data = await response.json() as SmsCodeEnvelope<T>;
    if (!response.ok || !data.success) {
      return {
        success: false,
        errorMessage: !data.success ?
          data.error?.message ?? data.error?.code ?? "SMSCode request failed." :
          `SMSCode request failed with HTTP ${response.status}.`,
      };
    }
    return {success: true, data: data.data};
  }
}
