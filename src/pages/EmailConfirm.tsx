import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    console.log("EmailConfirm LOADED");

    let token: string | null = null;
    let type: string | null = null;
    let email: string | null = null;

    // read from query
    const qs = new URLSearchParams(window.location.search);
    token = qs.get("token") || qs.get("token_hash");
    type = qs.get("type") || "email";
    email = qs.get("email");

    // read from hash fragment
    if (!token) {
      const hash = new URLSearchParams(window.location.hash.slice(1));

      token =
        hash.get("token_hash") || hash.get("access_token") || hash.get("token");

      type = hash.get("type") || "email";
      email = hash.get("email");
    }

    console.log("TOKEN =>", token);
    console.log("TYPE  =>", type);

    if (!token) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    supabase.auth
      .verifyOtp({
        token,
        type: "email", // 👈 WAJIB: Email verification
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

  return <div style={{ padding: 20 }}>{message}</div>;
}
