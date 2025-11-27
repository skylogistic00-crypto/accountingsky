import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token_hash = params.get("token_hash");
    const typeFromSupabase = params.get("type");

    if (!token_hash) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    // MAP SUPABASE TYPE → VERIFYOTP TYPE
    let type: any = "signup"; // default untuk confirm signup

    if (typeFromSupabase === "recovery") type = "recovery";
    if (typeFromSupabase === "email_change") type = "email_change";
    if (typeFromSupabase === "invite") type = "invite";

    supabase.auth
      .verifyOtp({
        token_hash,
        type,
      })
      .then(({ error }) => {
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
