import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Memverifikasi email...");

  useEffect(() => {
    console.log("EmailConfirm LOADED");

    let token: string | null = null;
    let type: string | null = null;
    let email: string | null = null;

    // 1️⃣ Ambil dari query (?token=)
    const qs = new URLSearchParams(window.location.search);
    token = qs.get("token") || qs.get("token_hash");
    type = qs.get("type");
    email = qs.get("email");

    // 2️⃣ Ambil dari hash (#access_token=)
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    if (!token) {
      token =
        hashParams.get("access_token") ||
        hashParams.get("token") ||
        hashParams.get("token_hash");
    }

    if (!type) {
      type = hashParams.get("type") || hashParams.get("event") || "signup";
    }

    if (!email) {
      email = hashParams.get("email") || undefined;
    }

    console.log("FINAL TOKEN  =>", token);
    console.log("FINAL TYPE   =>", type);
    console.log("FINAL EMAIL  =>", email);

    if (!token || !type) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    // 3️⃣ VERIFIKASI TOKEN
    supabase.auth
      .verifyOtp({
        token,
        type,
        email: email ?? undefined,
      })
      .then(async ({ error }) => {
        if (error) {
          console.error("VERIFY ERROR:", error);
          setMessage("Verification failed: " + error.message);
          return;
        }

        console.log("EMAIL VERIFIED SUCCESS");

        // 4️⃣ Hentikan auto-login Supabase
        await supabase.auth.signOut();

        setMessage("Email berhasil dikonfirmasi! Menunggu persetujuan admin…");

        setTimeout(() => {
          window.location.href = "/pending-registrasi";
        }, 2000);
      });
  }, []);

  return <div style={{ padding: 30 }}>{message}</div>;
}
