import { useState } from "react";
import Login from "../components/auth/login";
import Register from "../components/auth/register";
import Password from "../components/auth/password";

export type AuthView = "login" | "register" | "password";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("login");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/80 backdrop-blur-md rounded-2xl border-2 border-[#1800ad] shadow-[0_0_25px_#1800ad] p-6">
        {view === "login" && <Login onChangeView={setView} />}
        {view === "register" && <Register onChangeView={setView} />}
        {view === "password" && <Password onChangeView={setView} />}
      </div>
    </div>
  );
}
