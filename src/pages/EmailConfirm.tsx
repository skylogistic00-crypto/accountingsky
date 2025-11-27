import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const url = new URL(window.location.href);
    const token_hash = url.searchParams.get("token_hash");
    const type = "email"; // HARUS email untuk confirm signup

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
          setMessage("Email confirmed successfully! Redirecting...");
          setTimeout(() => (window.location.href = "/login"), 2000);
        }
      });
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
