import { useState } from "react";
import {
  FiInfo,
  FiUpload,
  FiLock,
  FiChevronDown,
  FiDownload,
} from "react-icons/fi";

interface ImportUsersModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ImportUsersModal({
  open,
  onClose,
}: ImportUsersModalProps) {
  const [useDefaultPassword, setUseDefaultPassword] = useState(false);

  if (!open) return null;

  return (
    // 🔥 OVERLAY DEFINITIVO
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-xl mx-4 bg-[#050713] border border-blue-900 rounded-3xl p-8 space-y-6 text-white">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">
              Import users
            </h2>
            <p className="text-sm text-blue-400 mt-1">
              Import multiple users using a CSV file.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-300 transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* ================= INFO BOX ================= */}
        <div className="border border-blue-900 rounded-2xl p-5 bg-[#06081A] space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
            <FiInfo />
            <span>Available CSV fields</span>
          </div>

          <ul className="text-sm space-y-1">
            <li>
              <strong className="text-white">name</strong> (required): User name
            </li>
            <li>
              <strong className="text-white">email</strong> (required): User email
            </li>
            <li>
              <strong className="text-white">phone</strong> (optional): User phone
            </li>
            <li>
              <strong className="text-white">accession</strong> (optional): Access start date (dd/MM/yyyy HH:mm:ss)
            </li>
          </ul>
        </div>

        {/* ================= DOWNLOAD TEMPLATE ================= */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-900 text-blue-300 hover:border-blue-700 hover:text-blue-200 transition">
            <FiDownload />
            Download CSV template
          </button>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-blue-900/60" />

        {/* ================= FORM ================= */}
        <div className="space-y-5">
          {/* FILE INPUT */}
          <div>
            <label className="text-sm text-blue-300">
              Select CSV file
            </label>
            <div className="relative mt-2">
              <FiUpload className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="file"
                accept=".csv"
                className="w-full bg-[#06081A] border border-blue-900 rounded-xl pl-11 pr-4 py-2 text-white file:hidden"
              />
            </div>
          </div>

          {/* DELIVERIES */}
          <div>
            <label className="text-sm text-blue-300">
              Deliveries
            </label>
            <div className="relative mt-2">
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
              <select className="w-full appearance-none bg-[#06081A] border border-blue-900 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-600">
                <option>Admin</option>
                <option>Membro</option>
                <option>Bot</option>
              </select>
            </div>
          </div>

          {/* TOGGLE */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-blue-300">
              Use default password for all users?
            </span>

            <button
              onClick={() => setUseDefaultPassword((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                useDefaultPassword
                  ? "bg-blue-600"
                  : "bg-blue-900"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  useDefaultPassword ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* PASSWORD (ANIMATED) */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              useDefaultPassword
                ? "max-h-40 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="mt-4">
              <label className="text-sm text-blue-300">
                Default password
              </label>
              <div className="relative mt-2">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="password"
                  placeholder="Insert default password"
                  className="w-full bg-[#06081A] border border-blue-900 rounded-xl pl-11 pr-4 py-2 text-white placeholder:text-blue-500/60 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-blue-900 text-blue-300 hover:border-blue-700 hover:text-blue-200 transition"
          >
            Cancel
          </button>

          <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition shadow-[0_0_20px_rgba(59,130,246,0.35)] font-medium">
            Import users
          </button>
        </div>
      </div>
    </div>
  );
}
