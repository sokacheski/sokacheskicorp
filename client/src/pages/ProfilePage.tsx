import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { api } from '../services/api';
import { User, Mail, Phone, Shield, LogOut, Save, X } from 'lucide-react';
import MarketBackground from '../seels/MarketBackground';

export default function ProfilePage() {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.put('/protected/profile', formData);
      await refreshUser();
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <MarketBackground />
      
      <div className="relative z-10 pt-20 pb-16 px-4 md:px-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
            Meu Perfil
          </h1>
          <p className="text-gray-400 mt-2">Gerencie suas informações pessoais</p>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Card do perfil */}
        <div className="bg-black/60 backdrop-blur-sm border border-blue-900/30 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-blue-900/30">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center">
              <User size={32} className="text-white/90" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user?.name || 'Carregando...'}</h2>
              <p className="text-gray-400 flex items-center gap-1 mt-1">
                <Shield size={14} />
                {user?.role === 'admin' ? 'Administrador' : 'Membro'}
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 items-center gap-2">
                <User size={16} /> Nome completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-blue-900/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white bg-[#1E293B]/50 rounded-lg px-4 py-2">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 items-center gap-2">
                <Mail size={16} /> E-mail
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-blue-900/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white bg-[#1E293B]/50 rounded-lg px-4 py-2">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 items-center gap-2">
                <Phone size={16} /> Telefone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-[#1E293B] border border-blue-900/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white bg-[#1E293B]/50 rounded-lg px-4 py-2">{user?.phone || 'Não informado'}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 mt-8 pt-4 border-t border-blue-900/30">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Editar Perfil
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition ml-auto"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}