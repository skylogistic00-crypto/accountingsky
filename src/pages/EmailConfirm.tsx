import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash"); // <-- perhatikan ini

    if (!token_hash) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    supabase.auth
      .verifyOtp({
        token_hash,
        type: "email",
      })
      .then(({ error }) => {
        if (error) {
          setMessage("Confirmation failed: " + error.message);
        } else {
          setMessage("Email confirmed! Redirecting...");
          setTimeout(() => (window.location.href = "/"), 2000);
        }
      });
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
