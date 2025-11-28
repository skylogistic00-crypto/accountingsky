import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Memverifikasi email Anda...");

  useEffect(() => {
    console.log("EmailConfirm LOADED");

    // Supabase menambahkan “verified” di URL hash
    const hash = window.location.hash;

    if (hash.includes("type=signup") || hash.includes("verified")) {
      setMessage("Email berhasil dikonfirmasi! Menunggu persetujuan admin...");

      setTimeout(() => {
        window.location.href = "/pending-registrasi";
      }, 2000);

      return;
    }

    // Jika tidak cocok
    setMessage("Invalid or missing confirmation token.");
  }, []);

  return <div style={{ padding: 20 }}>{message}</div>;
}
