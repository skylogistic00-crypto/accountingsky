import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const params = new URLSearchParams(hash);

    const token_hash = params.get("token_hash");
    const type = params.get("type") || "signup";

    if (!token_hash) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    supabase.auth
      .verifyOtp({
        token_hash,
        type,
      })
      .then(({ error }) => {
        if (error) setMessage("Confirmation failed: " + error.message);
        else {
          setMessage("Email confirmed successfully! Redirecting...");
          setTimeout(() => (window.location.href = "/login"), 2000);
        }
      });
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
