import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    console.log("EmailConfirm LOADED");

    let token: string | null = null;
    let type: string | null = null;
    let email: string | null = null;

    // 🟦 1️⃣ Cek query string (?token, ?token_hash)
    const qs = new URLSearchParams(window.location.search);
    token = qs.get("token") || qs.get("token_hash");
    type = qs.get("type");
    email = qs.get("email");

    // 🟩 2️⃣ Cek hash fragment (#access_token, #token_hash, #type)
    if (!token) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));

      token =
        hashParams.get("access_token") ||
        hashParams.get("token") ||
        hashParams.get("token_hash");

      type = hashParams.get("type") || hashParams.get("event") || "signup";

      email = hashParams.get("email");
    }

    console.log("TOKEN =>", token);
    console.log("TYPE  =>", type);
    console.log("EMAIL =>", email);

    if (!token || !type) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    // 🟧 3️⃣ VERIFY OTP
    supabase.auth
      .verifyOtp({
        token,
        type,
        email: email ?? undefined,
      })
      .then(async ({ error }) => {
        if (error) {
          console.error(error);
          setMessage("Confirmation failed: " + error.message);
          return;
        }

        // 🟥 4️⃣ Hentikan auto-login Supabase
        await supabase.auth.signOut();

        setMessage("Email dikonfirmasi! Menunggu persetujuan admin…");

        setTimeout(() => {
          window.location.href = "/pending-registrasi";
        }, 2000);
      });
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
