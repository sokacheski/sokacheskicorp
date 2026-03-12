import { useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
} from "react-icons/fi";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // 🔥 callback para atualizar tabela
}

export default function CreateUserModal({
  open,
  onClose,
  onCreated,
}: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "bot">("member");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole("member");
  }

  async function handleCreateUser() {
    if (!name || !email || !password) {
      alert("Name, email and password are required");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3333/protected/users",
        {
          name,
          email,
          password,
          phone,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      resetForm();
      onClose();
      onCreated?.(); // 🔥 atualiza lista sem reload
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);

      alert(
        error?.response?.data?.message ||
        "Erro ao criar usuário"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/80 backdrop-blur-sm
        flex items-center justify-center
      "
    >
      <div className="relative w-full max-w-lg mx-4 bg-[#050713] border border-blue-900 rounded-3xl p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Create user
          </h2>
          <p className="text-sm text-blue-400 mt-1">
            Fill out the form to create the user.
          </p>
        </div>

        <div className="h-px bg-blue-900/60" />

        <div className="space-y-5">
          {/* USERNAME */}
          <div>
            <label className="text-sm text-blue-300">Username</label>
            <div className="relative mt-2">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Insert username"
                className="w-full bg-[#06081A] border border-blue-900 rounded-xl pl-11 pr-4 py-2 text-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-blue-300">E-mail</label>
            <div className="relative mt-2">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Insert email"
                className="w-full bg-[#06081A] border border-blue-900 rounded-xl pl-11 pr-4 py-2 text-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-blue-300">Password</label>
            <div className="relative mt-2">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insert password"
                className="w-full bg-[#06081A] border border-blue-900 rounded-xl pl-11 pr-4 py-2 text-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm text-blue-300">Phone</label>
            <div className="relative mt-2">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="47 99756-9190"
                className="w-full bg-[#06081A] border border-blue-900 rounded-xl pl-11 pr-4 py-2 text-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* ROLE */}
          <div>
            <label className="text-sm text-blue-300">User type</label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "admin" | "member" | "bot")
              }
              className="mt-2 w-full bg-[#06081A] border border-blue-900 rounded-xl px-4 py-2 text-white focus:border-blue-600 outline-none"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="bot">Bot</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-blue-900 text-blue-300 hover:border-blue-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create user"}
          </button>
        </div>
      </div>
    </div>
  );
}
