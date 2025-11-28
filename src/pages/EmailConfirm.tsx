import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Memverifikasi email...");

  useEffect(() => {
    console.log("EmailConfirm LOADED");

    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const type = params.get("type") || "signup";

    console.log("TOKEN =", token);
    console.log("TYPE =", type);

    if (!token) {
      setMessage("Invalid or missing confirmation token.");
      return;
    }

    // 🔥 VERIFIKASI TOKEN SIGNUP
    supabase.auth
      .verifyOtp({
        token,
        type: "signup",
        email: "", // tidak wajib untuk signup
      })
      .then(async ({ error }) => {
        if (error) {
          console.error(error);
          setMessage("Konfirmasi gagal: " + error.message);
          return;
        }

        // CEGAH auto-login
        await supabase.auth.signOut();

        setMessage(
          "Email berhasil dikonfirmasi! Menunggu persetujuan admin...",
        );

        setTimeout(() => {
          window.location.href = "/pending-registrasi";
        }, 2000);
      });
  }, []);

  return <div style={{ padding: 40 }}>{message}</div>;
}
