import { describe, expect, it } from "vitest";
import { registerFormSchema } from "./register-form.schema";

const valid = {
  name: "Ana",
  email: "ana@acme.ph",
  password: "Secret#123",
  confirmPassword: "Secret#123",
  agreeToTerms: false,
};

describe("registerFormSchema", () => {
  it("requires agreeing to the Terms while they are live", () => {
    const result = registerFormSchema(true).safeParse(valid);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["agreeToTerms"]);
  });

  it("accepts the agreement while the Terms are live", () => {
    expect(
      registerFormSchema(true).safeParse({ ...valid, agreeToTerms: true })
        .success,
    ).toBe(true);
  });

  it("doesn't ask while the Terms aren't live", () => {
    expect(registerFormSchema(false).safeParse(valid).success).toBe(true);
  });
});
