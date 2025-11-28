import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Memverifikasi email...");

  useEffect(() => {
    console.log("EmailConfirm LOADED");

    let token: string | null = null;
    let type: string | null = null;
    let email: string | null = null;

    // 1️⃣ Cek query string (?token)
    const qs = new URLSearchParams(window.location.search);
    token = qs.get("token") || qs.get("token_hash");
    type = qs.get("type");
    email = qs.get("email");

    // 2️⃣ Jika tidak ada, baca dari HASH (#access_token)
    if (!token) {
      const hash = window.location.hash.slice(1); // buang '#'
      const hp = new URLSearchParams(hash);

      token = hp.get("access_token") || hp.get("token") || hp.get("token_hash");

      type = hp.get("type") || hp.get("event") || "signup";
      email = hp.get("email");
    }

    console.log("FINAL TOKEN =>", token);
    console.log("FINAL TYPE  =>", type);
    console.log("FINAL EMAIL =>", email);

    if (!token) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    supabase.auth
      .verifyOtp({
        token,
        type: type ?? "signup",
        email: email ?? undefined,
      })
      .then(async ({ error }) => {
        if (error) {
          console.error(error);
          setMessage("Confirmation failed: " + error.message);
          return;
        }

        await supabase.auth.signOut();

        setMessage("Email dikonfirmasi! Menunggu persetujuan admin…");

        setTimeout(() => {
          window.location.href = "/pending-registrasi";
        }, 2000);
      });
  }, []);

  return <div style={{ padding: 30 }}>{message}</div>;
}
