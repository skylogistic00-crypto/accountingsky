import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, UserProfile } from "../lib/supabase";
import { createClient } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    let hasError = false;
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
        *,
        roles:roles!users_role_id_fkey (
          role_id,
          role_name,
          description,
          permissions
        )
      `,
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        hasError = true;
        console.error("Error fetching user profile:", error);
        throw error;
      }

      // If user doesn't exist yet (trigger hasn't run), wait and retry
      if (!data && retryCount < 3) {
        console.log(`User not found, retrying (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), 1000);
        return;
      }

      if (!data) {
        console.error("User profile not found after retries");
        return;
      }

      console.log("👤 User Profile with Role:", data);

      setUserProfile(data);

      const role = data.role_name || data.roles?.role_name || null;

      setUserRole((role || "").toLowerCase().trim().replace(/\s+/g, "_"));
    } catch (error: any) {
      hasError = true;
      console.error("Error fetching user profile:", error);
      // Set loading to false even on error so UI doesn't hang
      if (retryCount >= 2) {
        // After retries failed, show a more user-friendly state
        setUserProfile(null);
      }
    } finally {
      if (retryCount >= 2 || !hasError) {
        setLoading(false);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // 1. Cek status user
      const { data: userCheck, error: userError } = await supabase
        .from("users")
        .select("id, status")
        .eq("email", email)
        .single();

      if (userError || !userCheck) {
        throw { type: "not_found", message: "Akun tidak ditemukan" };
      }

      // 2. Status = suspended
      if (userCheck.status === "suspended") {
        throw { type: "suspended", message: "Akun Anda ditangguhkan" };
      }

      // 3. Status = inactive
      if (userCheck.status === "inactive") {
        throw { type: "inactive", message: "Akun Anda tidak aktif" };
      }

      // 4. Status aktif → lanjut login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw { type: "auth", message: error.message };
      return data;
    } catch (err: any) {
      throw err; // -> dilempar ke Header untuk ditampilkan via modal
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role_name: string = "read_only",
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          role_name: roleName,
        },
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, userProfile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
