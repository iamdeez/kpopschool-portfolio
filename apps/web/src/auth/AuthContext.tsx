import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { subscribeToAuthState } from "../firebase/auth";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ firebaseUser: null, isAdmin: false, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ firebaseUser: null, isAdmin: false, loading: true });

  useEffect(() => {
    return subscribeToAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        setState({ firebaseUser: null, isAdmin: false, loading: false });
        return;
      }
      const tokenResult = await firebaseUser.getIdTokenResult();
      setState({ firebaseUser, isAdmin: tokenResult.claims.admin === true, loading: false });
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
