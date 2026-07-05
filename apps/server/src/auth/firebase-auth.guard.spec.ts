import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { FirebaseAuthGuard } from "./firebase-auth.guard";

function makeContext(headers: Record<string, string>) {
  const request: { headers: Record<string, string>; user?: unknown } = { headers };
  return {
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    request,
  };
}

describe("FirebaseAuthGuard (SC-008: no valid token -> 401)", () => {
  it("rejects a request with no Authorization header", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guard = new FirebaseAuthGuard({} as any);
    const { context } = makeContext({});
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects a request whose token fails verification", async () => {
    const fakeApp = { auth: () => ({ verifyIdToken: () => Promise.reject(new Error("bad token")) }) };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guard = new FirebaseAuthGuard(fakeApp as any);
    const { context } = makeContext({ authorization: "Bearer bad-token" });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("attaches request.user and admits the request for a valid token", async () => {
    const fakeApp = {
      auth: () => ({
        verifyIdToken: () => Promise.resolve({ uid: "u1", email: "u1@example.com", admin: true }),
      }),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guard = new FirebaseAuthGuard(fakeApp as any);
    const { context, request } = makeContext({ authorization: "Bearer good-token" });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ uid: "u1", email: "u1@example.com", isAdmin: true });
  });
});
