import { useEffect, useState } from "react";

export default function EmailConfirm() {
  const [message, setMessage] = useState("Memverifikasi email...");

  useEffect(() => {
    console.log("EmailConfirm loaded — preventing auto login");

    // Hapus semua session lokal supabase
    localStorage.removeItem("supabase.auth.token");
    localStorage.removeItem("sb-%-auth-token"); // wildcard untuk client baru Supabase
    sessionStorage.clear();

    // Pastikan hash dihapus agar Supabase tidak ambil token
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    setMessage("Email berhasil dikonfirmasi. Silakan login kembali.");

    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>{message}</h1>
    </div>
  );
}
