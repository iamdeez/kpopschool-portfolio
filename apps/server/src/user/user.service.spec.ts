import { FakeFirestore } from "../testing/fake-firestore";
import { UserService } from "./user.service";

function makeFakeFirebaseApp() {
  let counter = 0;
  return {
    auth: () => ({
      createUser: (input: { email: string; password: string; displayName: string }) => {
        counter += 1;
        return Promise.resolve({ uid: `uid-${counter}`, email: input.email });
      },
      deleteUser: () => Promise.resolve(),
      updateUser: () => Promise.resolve(),
    }),
  };
}

describe("UserService.register (SC-016: password never persisted or returned)", () => {
  it("does not include a password field in the returned profile", async () => {
    const firestore = new FakeFirestore();
    const app = makeFakeFirebaseApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = new UserService(firestore as any, app as any);

    const created = await service.register({
      email: "visitor@example.com",
      password: "super-secret-password",
      name: "Visitor",
    });

    expect(created).not.toHaveProperty("password");
  });

  it("does not persist a password field in the Firestore user document", async () => {
    const firestore = new FakeFirestore();
    const app = makeFakeFirebaseApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = new UserService(firestore as any, app as any);

    const created = await service.register({
      email: "visitor2@example.com",
      password: "super-secret-password",
      name: "Visitor Two",
    });

    const stored = await service.findOne(created.id);
    expect(stored).not.toHaveProperty("password");
  });
});
