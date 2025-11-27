import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const params = new URLSearchParams(hash);

    const token = params.get("access_token");
    const type = params.get("type") || "signup";

    // email HARUS diambil dari redirectTo
    const email = params.get("email");

    console.log("TOKEN:", token);
    console.log("TYPE:", type);
    console.log("EMAIL:", email);

    if (!token || !email) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    supabase.auth
      .verifyOtp({
        token,
        type,
        email,
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
