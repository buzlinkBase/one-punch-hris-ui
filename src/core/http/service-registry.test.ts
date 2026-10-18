import { describe, expect, it } from "vitest";
import {
  UNKNOWN_SERVICE,
  serviceKeyOf,
  unreachableMessage,
} from "./service-registry";

const development = {
  auth: "https://localhost:7077",
  hrms: "https://localhost:7237",
  clientPortal: "https://localhost:7147",
};
const production = {
  auth: "auth",
  hrms: "hrms",
  clientPortal: "client-portal",
};

describe("serviceKeyOf", () => {
  it("matches an absolute service address (development)", () => {
    expect(
      serviceKeyOf("https://localhost:7147/api/v1/clients", development),
    ).toBe("clientPortal");
    expect(serviceKeyOf("https://localhost:7237/api/v1/x", development)).toBe(
      "hrms",
    );
  });

  it("matches a relative gateway segment, with or without a leading slash (production)", () => {
    expect(serviceKeyOf("client-portal/api/v1/clients", production)).toBe(
      "clientPortal",
    );
    expect(serviceKeyOf("/hrms/api/v1/employees", production)).toBe("hrms");
  });

  it("does not mistake a longer segment for a service", () => {
    expect(serviceKeyOf("hrms-reports/api/v1/x", production)).toBe(
      UNKNOWN_SERVICE,
    );
  });

  it("falls back to the unknown service for anything else", () => {
    expect(serviceKeyOf(undefined, production)).toBe(UNKNOWN_SERVICE);
    expect(serviceKeyOf("https://elsewhere.test/x", production)).toBe(
      UNKNOWN_SERVICE,
    );
  });

  it("ignores a service with no prefix configured", () => {
    expect(serviceKeyOf("anything/api", { hrms: undefined, auth: "" })).toBe(
      UNKNOWN_SERVICE,
    );
  });
});

describe("unreachableMessage", () => {
  it("names a single service", () => {
    expect(unreachableMessage(["clientPortal"])).toBe(
      "Can't reach the client portal service.",
    );
  });

  it("lists several services", () => {
    expect(unreachableMessage(["hrms", "clientPortal"])).toBe(
      "Can't reach the HR and client portal services.",
    );
    expect(unreachableMessage(["auth", "hrms", "tenants"])).toBe(
      "Can't reach the sign-in, HR and company services.",
    );
  });

  it("is generic when the service isn't known", () => {
    expect(unreachableMessage([UNKNOWN_SERVICE])).toBe(
      "Can't reach the server.",
    );
    expect(unreachableMessage([])).toBe("Can't reach the server.");
  });
});
