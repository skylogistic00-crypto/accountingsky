import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    console.log("EmailConfirm page LOADED");

    let token = null;
    let type = null;
    let email = null;

    // 1️⃣ Cek query
    const paramsQuery = new URLSearchParams(window.location.search);
    token = paramsQuery.get("token");
    type = paramsQuery.get("type");
    email = paramsQuery.get("email");

    // 2️⃣ Cek hash fragment
    if (!token) {
      const hash = window.location.hash.replace("#", "");
      const paramsHash = new URLSearchParams(hash);

      token = paramsHash.get("token") || paramsHash.get("access_token");
      type = paramsHash.get("type") || "signup";
      email = paramsHash.get("email");
    }

    console.log("TOKEN:", token);
    console.log("TYPE:", type);

    if (!token || !type) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    supabase.auth
      .verifyOtp({ token, type, email: email ?? undefined })
      .then(async ({ error }) => {
        if (error) {
          setMessage("Confirmation failed: " + error.message);
          return;
        }

        await supabase.auth.signOut();

        setMessage(
          "Email berhasil dikonfirmasi! Menunggu persetujuan admin...",
        );

        setTimeout(() => {
          window.location.href = "/pending-registrasi";
        }, 2000);
      });
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
