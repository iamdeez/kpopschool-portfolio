import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import type { AuthenticatedUser } from "./firebase-auth.guard";

function makeContext(user: AuthenticatedUser | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("RolesGuard (SC-008/SC-014: role + ownership enforcement)", () => {
  it("allows the request through when the route has no @Roles() metadata", () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext({ uid: "u1", isAdmin: false }))).toBe(true);
  });

  it("throws ForbiddenException when admin is required but the user is not an admin", () => {
    const reflector = { getAllAndOverride: () => ["admin"] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(makeContext({ uid: "u1", isAdmin: false }))).toThrow(
      ForbiddenException,
    );
  });

  it("allows the request through when the user has the admin custom claim", () => {
    const reflector = { getAllAndOverride: () => ["admin"] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext({ uid: "u1", isAdmin: true }))).toBe(true);
  });
});
