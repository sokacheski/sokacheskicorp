import { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiTrash,
} from "react-icons/fi";
import axios from "axios";
import { usePageTitle } from "../../hooks/usePageTitle";

// ✅ MODAIS
import ImportUsersModal from "../../components/users/import";
import CreateUserModal from "../../components/users/create";
import ConfirmDeleteUserModal from "../../components/users/confirm";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "member" | "bot";
  createdAt?: string;
  lastLogin?: string;
}

const API_URL = "http://localhost:3333";

function Users() {
  usePageTitle("Users");

  const [users, setUsers] = useState<User[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔎 FILTROS
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<"all" | "admin" | "member" | "bot">("all");

  // ✅ MODAIS
  const [openImport, setOpenImport] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  // 🗑 DELETE
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  /* =========================
     🔄 CARREGAR USUÁRIOS
     ✅ ROTA CORRETA: /protected/users
  ========================= */
  async function loadUsers() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token não encontrado");
        setUsers([]);
        return;
      }

      const response = await axios.get(
        `${API_URL}/protected/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários", error);
      setUsers([]);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* =========================
     🔍 SEARCH + FILTRO
  ========================= */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch = user.email
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  /* =========================
     🔢 ORDENAR (ADMIN PRIMEIRO)
  ========================= */
  const orderedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (a.role === "admin") return -1;
      if (b.role === "admin") return 1;

      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;
      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateA - dateB;
    });
  }, [filteredUsers]);

  /* =========================
     📄 PAGINAÇÃO
  ========================= */
  const totalPages = Math.max(
    1,
    Math.ceil(orderedUsers.length / itemsPerPage)
  );

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return orderedUsers.slice(start, end);
  }, [orderedUsers, currentPage, itemsPerPage]);

  /* =========================
     🧩 HELPERS
  ========================= */
  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatUserId = (id: string) => {
    return id ? `${id.slice(0, 4)}...` : "-";
  };

  /* =========================
     🗑 DELETE
  ========================= */
  function handleDeleteClick(user: User) {
    setSelectedUser(user);
    setOpenDelete(true);
  }

  return (
    <div className="w-full space-y-8 text-white">
      {/* ================= TOPO ================= */}
      <section className="flex justify-between items-center flex-wrap gap-6">
        <h1 className="text-3xl font-semibold">Users</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenImport(true)}
            className="px-5 py-2 rounded-xl border border-blue-900 bg-[#050713] text-blue-300 hover:border-blue-700 transition"
          >
            Importar Usuários
          </button>

          <button
            onClick={() => setOpenCreate(true)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
          >
            Criar Usuário
          </button>
        </div>
      </section>

      {/* ================= FILTROS ================= */}
      <section className="flex justify-between items-center flex-wrap gap-6">
        <div className="relative w-full max-w-md">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por email"
            className="w-full bg-[#06081A] border border-blue-900 rounded-xl px-4 py-2 pr-10 text-sm text-white placeholder-blue-400"
          />
          <FiSearch className="absolute right-4 top-2.5 text-blue-400" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value as any)
          }
          className="bg-[#06081A] border border-blue-900 rounded-xl px-4 py-2 text-sm text-blue-300"
        >
          <option value="all">Todos</option>
          <option value="admin">Admins</option>
          <option value="member">Membros</option>
          <option value="bot">Bots</option>
        </select>
      </section>

      {/* ================= TABELA ================= */}
      <section className="bg-[#050713] border border-blue-900 rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-blue-900 text-blue-300">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Nome</th>
              <th className="px-6 py-4 text-left">E-mail</th>
              <th className="px-6 py-4 text-left">Telefone</th>
              <th className="px-6 py-4 text-left">Criado em</th>
              <th className="px-6 py-4 text-left">Último acesso</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user._id}
                className="border-t border-blue-900/40 hover:bg-[#06081A]"
              >
                <td className="px-6 py-4">
                  {formatUserId(user._id)}
                </td>
                <td className="px-6 py-4 font-medium">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-blue-300">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  {user.phone || "-"}
                </td>
                <td className="px-6 py-4">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4">
                  {formatDate(user.lastLogin)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FiTrash />
                  </button>
                </td>
              </tr>
            ))}

            {paginatedUsers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-blue-400"
                >
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ================= PAGINAÇÃO ================= */}
      <section className="flex justify-between items-center text-sm text-blue-300">
        <span>
          Página {currentPage} de {totalPages}
        </span>

        <div className="flex gap-3">
          <button
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
            className="p-2 border border-blue-900 rounded-lg"
          >
            <FiChevronLeft />
          </button>

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            className="p-2 border border-blue-900 rounded-lg"
          >
            <FiChevronRight />
          </button>
        </div>
      </section>

      {/* ================= MODAIS ================= */}
      {openImport && (
        <ImportUsersModal
          open={openImport}
          onClose={() => setOpenImport(false)}
        />
      )}

      {openCreate && (
        <CreateUserModal
          open={openCreate}
          onClose={() => {
            setOpenCreate(false);
            loadUsers();
          }}
        />
      )}

      {openDelete && selectedUser && (
        <ConfirmDeleteUserModal
          open={openDelete}
          user={selectedUser}
          onClose={() => {
            setOpenDelete(false);
            setSelectedUser(null);
          }}
          onDeleted={loadUsers}
        />
      )}
    </div>
  );
}

export default Users;
