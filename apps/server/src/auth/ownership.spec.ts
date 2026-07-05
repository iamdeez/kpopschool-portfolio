import { ForbiddenException } from "@nestjs/common";
import { assertOwner } from "./ownership";

describe("assertOwner (SC-014)", () => {
  it("passes when the current user owns the resource", () => {
    expect(() => assertOwner({ uid: "u1", isAdmin: false }, "u1")).not.toThrow();
  });

  it("passes for an admin acting on someone else's resource", () => {
    expect(() => assertOwner({ uid: "admin-1", isAdmin: true }, "u1")).not.toThrow();
  });

  it("throws ForbiddenException for a non-owner, non-admin user", () => {
    expect(() => assertOwner({ uid: "u2", isAdmin: false }, "u1")).toThrow(ForbiddenException);
  });
});
