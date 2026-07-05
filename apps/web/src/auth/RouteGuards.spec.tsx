import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAdmin, RequireAuth } from "./RouteGuards";

const mockUseAuth = vi.fn();
vi.mock("./AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderGuarded(Guard: typeof RequireAuth, initialPath: string, redirectTo: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={redirectTo} element={<div>redirected</div>} />
        <Route
          path={initialPath}
          element={
            <Guard>
              <div>protected content</div>
            </Guard>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth (SC-009-adjacent: unauthenticated users can't reach gated pages)", () => {
  it("redirects to /signin when there is no firebase user", () => {
    mockUseAuth.mockReturnValue({ firebaseUser: null, isAdmin: false, loading: false });
    renderGuarded(RequireAuth, "/mypage", "/signin");
    expect(screen.getByText("redirected")).toBeInTheDocument();
  });

  it("renders the protected content when signed in", () => {
    mockUseAuth.mockReturnValue({ firebaseUser: { uid: "u1" }, isAdmin: false, loading: false });
    renderGuarded(RequireAuth, "/mypage", "/signin");
    expect(screen.getByText("protected content")).toBeInTheDocument();
  });
});

describe("RequireAdmin (SC-009: admin routes reject non-admins)", () => {
  it("redirects to /admin/login for a signed-in but non-admin user", () => {
    mockUseAuth.mockReturnValue({ firebaseUser: { uid: "u1" }, isAdmin: false, loading: false });
    renderGuarded(RequireAdmin, "/admin", "/admin/login");
    expect(screen.getByText("redirected")).toBeInTheDocument();
  });

  it("renders the dashboard for an admin user", () => {
    mockUseAuth.mockReturnValue({ firebaseUser: { uid: "admin-1" }, isAdmin: true, loading: false });
    renderGuarded(RequireAdmin, "/admin", "/admin/login");
    expect(screen.getByText("protected content")).toBeInTheDocument();
  });
});
