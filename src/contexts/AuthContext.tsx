import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiFetch } from "../lib/api";

export interface BackendUser {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

interface AuthError {
  message: string;
}

interface AuthContextType {
  user: BackendUser | null;
  loading: boolean;

  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ error: AuthError | null }>;

  signIn: (
    identifier: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;

  signOut: () => Promise<void>;

  verifyOtp: (
    target: string,
    code: string
  ) => Promise<{ error: AuthError | null }>;

  resendOtp: (target: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ------------------------------------------------------
   SAFE API WRAPPER WITH AUTO TOKEN REFRESH
------------------------------------------------------ */
async function safeApi(path: string, options?: RequestInit) {
  try {
    return await apiFetch(path, options);
  } catch (e: any) {
    if (e.message.includes("401") || e.message.includes("Unauthorized")) {
      try {
        await apiFetch("refresh", { method: "POST" });
        return await apiFetch(path, options);
      } catch (refreshErr) {
        throw refreshErr;
      }
    }
    throw e;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------
     LOAD /ME ON PAGE LOAD
------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const me = await safeApi("me");
        setUser(me?.user ?? me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ------------------------------------------------------
     🔄 SILENT REFRESH EVERY 10 MINUTES
------------------------------------------------------ */
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      apiFetch("refresh", { method: "POST" })
        .then(() => console.log("Silent refresh successful"))
        .catch(() => console.warn("Silent refresh failed"));
    }, 2 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [user]);

  /* ------------------------------------------------------
     SIGN UP
------------------------------------------------------ */
  const signUp: AuthContextType["signUp"] = async (
    email,
    password,
    fullName,
    phone
  ) => {
    try {
      await apiFetch("signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          phone,
        }),
      });

      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  };

  /* ------------------------------------------------------
     SIGN IN
------------------------------------------------------ */
  const signIn: AuthContextType["signIn"] = async (
    identifier,
    password
  ) => {
    try {
      const isEmail = /\S+@\S+\.\S+/.test(identifier);

      const payload = isEmail
        ? { email: identifier, password }
        : { mobile: identifier, password };

      await apiFetch("login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const me = await safeApi("me");
      setUser(me.user ?? me);

      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  };

  /* ------------------------------------------------------
     LOGOUT
------------------------------------------------------ */
  const signOut = async () => {
    try {
      await apiFetch("logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  /* ------------------------------------------------------
     OTP VERIFY
------------------------------------------------------ */
  const verifyOtp = async (target: string, code: string) => {
    try {
      await apiFetch("verify-otp", {
        method: "POST",
        body: JSON.stringify({ target, code }),
      });

      const me = await safeApi("me");
      setUser(me?.user ?? me);

      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  };

  const resendOtp = async (target: string) => {
    try {
      await apiFetch("resend-otp", {
        method: "POST",
        body: JSON.stringify({ target }),
      });
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        verifyOtp,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ------------------------------------------------------
   EXPORTED HOOK
------------------------------------------------------ */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
