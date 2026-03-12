import axios from "axios";
import { FiAlertTriangle, FiTrash2, FiUser, FiMail } from "react-icons/fi";
import { useState } from "react";

interface ConfirmDeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  user: {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "member" | "bot";
  } | null;
}

export default function ConfirmDeleteUserModal({
  open,
  onClose,
  onDeleted,
  user,
}: ConfirmDeleteUserModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open || user === null) return null;

  const u = user;

  async function handleDeleteUser() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3333/protected/users/${u._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onClose();
      onDeleted?.();
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);

      alert(
        error?.response?.data?.message ||
        "Erro ao excluir usuário"
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
      <div className="relative w-full max-w-md mx-4 bg-[#050713] border border-blue-900 rounded-3xl p-8 space-y-6">
        {/* HEADER */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-800">
            <FiAlertTriangle className="text-blue-400 text-2xl" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">
              Delete user
            </h2>
            <p className="text-sm text-blue-400 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="h-px bg-blue-900/60" />

        {/* USER INFO */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-300">
            <FiUser className="text-blue-400" />
            <span className="text-white font-medium">
              {u.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-blue-300">
            <FiMail className="text-blue-400" />
            <span>{u.email}</span>
          </div>

          <div className="text-sm">
            <span className="text-blue-400">Role:</span>{" "}
            <span className="text-white capitalize">
              {u.role}
            </span>
          </div>
        </div>

        {/* ⚠️ WARNING (VERMELHO) */}
        <div className="rounded-xl border border-red-800 bg-red-500/10 p-4 text-sm text-red-300">
          Deleting this user will permanently remove all associated data.
          This action is irreversible.
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="
              px-4 py-2 rounded-xl
              border border-blue-900
              text-blue-300
              hover:border-blue-700
              transition
            "
          >
            Cancel
          </button>

          {/* 🔴 DELETE */}
          <button
            onClick={handleDeleteUser}
            disabled={loading}
            className="
              flex items-center gap-2
              px-5 py-2 rounded-xl
              bg-red-600 hover:bg-red-500
              transition font-medium
              disabled:opacity-60
            "
          >
            <FiTrash2 />
            {loading ? "Deleting..." : "Delete user"}
          </button>
        </div>
      </div>
    </div>
  );
}
