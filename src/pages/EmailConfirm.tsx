import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    console.log("EmailConfirm LOADED");

    let token = null;
    let type = "signup"; // SUPABASE uses signup for email confirmation
    let email = null;

    // Check query parameters
    const qs = new URLSearchParams(window.location.search);
    email = qs.get("email");

    // Check hash fragment (#access_token=xxx)
    const hash = new URLSearchParams(window.location.hash.slice(1));
    token =
      hash.get("access_token") || hash.get("token") || hash.get("token_hash");

    console.log("Extracted TOKEN:", token);

    if (!token) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    // SUPABASE CONFIRM SIGNUP
    supabase.auth
      .verifyOtp({
        token,
        type: "signup", // IMPORTANT
        email: email ?? undefined,
      })
      .then(async ({ data, error }) => {
        if (error) {
          console.error(error);
          setMessage("Confirmation failed: " + error.message);
          return;
        }

        // Log user OUT so they cannot login until approved
        await supabase.auth.signOut();

        setMessage("Email berhasil dikonfirmasi! Menunggu persetujuan admin…");

        setTimeout(() => {
          window.location.href = "/pending-registrasi";
        }, 2000);
      });
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
