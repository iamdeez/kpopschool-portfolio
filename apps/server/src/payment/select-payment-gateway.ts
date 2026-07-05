import type { AppConfig } from "../common/config";
import type { PaymentGateway } from "./payment-gateway.interface";

/** Extracted for unit testing (SC-003) — payment.module.ts wires this via DI. */
export function selectPaymentGateway(
  config: AppConfig,
  real: PaymentGateway,
  mock: PaymentGateway,
): PaymentGateway {
  return config.integrationMode === "real" ? real : mock;
}
