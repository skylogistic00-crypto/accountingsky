import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const type = params.get("type");
    const email = params.get("email");

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
      .then(async ({ error }) => {
        if (error) {
          setMessage("Confirmation failed: " + error.message);
        } else {
          // 1️⃣ EMAIL VERIFIED TAPI USER BELUM BOLEH LOGIN
          await supabase.auth.signOut();

          // 2️⃣ TAMPILKAN INFORMASI MENUNGGU ADMIN
          setMessage(
            "Email berhasil dikonfirmasi! Akun Anda sedang menunggu persetujuan admin.",
          );

          // 3️⃣ ARAHKAN KE HALAMAN PENDING APPROVAL
          setTimeout(() => {
            window.location.href = "/pending-approval";
          }, 2000);
        }
      });
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
