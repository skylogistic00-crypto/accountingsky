import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    // Ambil token dari query (?token=xxx)
    const paramsQuery = new URLSearchParams(window.location.search);
    let token = paramsQuery.get("token");
    let type = paramsQuery.get("type");
    let email = paramsQuery.get("email");

    // Jika token tidak ada di query, cari dari hash (#token=xxx)
    if (!token) {
      const hash = window.location.hash.replace("#", "");
      const paramsHash = new URLSearchParams(hash);

      token = paramsHash.get("token");
      type = paramsHash.get("type") || "signup";
      email = paramsHash.get("email");
    }

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
