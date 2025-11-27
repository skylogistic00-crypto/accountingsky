import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const type = params.get("type");
    const email = params.get("email"); // Supabase kadang kirim email

    if (!token || !type) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    supabase.auth
      .verifyOtp({
        token,
        type,
        email: email ?? undefined,
      })
      .then(({ data, error }) => {
        if (error) {
          setMessage("Confirmation failed: " + error.message);
        } else {
          setMessage("Email confirmed! Redirecting...");
          setTimeout(() => (window.location.href = "/login"), 2000);
        }
      });
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
