import type { AppConfig } from "../common/config";
import type { PaymentGateway } from "./payment-gateway.interface";
import { selectPaymentGateway } from "./select-payment-gateway";

function baseConfig(integrationMode: AppConfig["integrationMode"]): AppConfig {
  return {
    port: 8080,
    integrationMode,
    firebase: { projectId: "", clientEmail: "", privateKey: "" },
    stripe: { secretKey: "" },
    zoom: { clientId: "", clientSecret: "", accountId: "", sdkKey: "", sdkSecret: "" },
    demo: { accountEmail: "", accountPassword: "" },
  };
}

describe("selectPaymentGateway (SC-003: INTEGRATION_MODE switches the adapter)", () => {
  const real = { marker: "real" } as unknown as PaymentGateway;
  const mock = { marker: "mock" } as unknown as PaymentGateway;

  it("selects the mock gateway when INTEGRATION_MODE=demo", () => {
    expect(selectPaymentGateway(baseConfig("demo"), real, mock)).toBe(mock);
  });

  it("selects the real (Stripe) gateway when INTEGRATION_MODE=real (SC-002)", () => {
    expect(selectPaymentGateway(baseConfig("real"), real, mock)).toBe(real);
  });
});
