import { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { 
  FiSearch,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiChevronRight,
  FiBarChart2,
  FiAward
} from "react-icons/fi";

// ================= TIPOS =================
interface ChartData {
  day: string;
  value: number;
}

interface Produto {
  _id: string;
  title: string;
  valor: string;
  vendas: number;
  faturamento: number;
  coverImage?: string;
  image?: string;
  posicaoAnterior?: number;
}

// ================= UTILIDADES =================
function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function formatDay(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

// ================= GERADOR DOS 30 DIAS =================
function generateLast30Days(): ChartData[] {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 29);

  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const random = seededRandom(seed);

  let baseValue = 280 + random() * 160;
  const data: ChartData[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const trend = 6;
    const noise = (random() - 0.5) * 90;
    const dropChance = random();

    if (dropChance < 0.12) {
      baseValue -= random() * 120;
    } else {
      baseValue += trend + noise;
    }

    if (baseValue < 120) baseValue = 120;

    data.push({
      day: formatDay(date),
      value: Math.round(baseValue),
    });
  }

  return data;
}

// ================= DADOS DOS PRODUTOS =================
const produtosData: Produto[] = [
  { 
    _id: "produto1", 
    title: "Marketing Digital Avançado", 
    valor: "R$ 497,00", 
    vendas: 156, 
    faturamento: 77532,
    coverImage: "https://via.placeholder.com/40x40/2563eb/ffffff?text=MD",
    posicaoAnterior: 2
  },
  { 
    _id: "produto2", 
    title: "Copywriting para Iniciantes", 
    valor: "R$ 297,00", 
    vendas: 124, 
    faturamento: 36828,
    coverImage: "https://via.placeholder.com/40x40/7c3aed/ffffff?text=CP",
    posicaoAnterior: 1
  },
  { 
    _id: "produto3", 
    title: "Vendas com Tráfego Pago", 
    valor: "R$ 397,00", 
    vendas: 89, 
    faturamento: 35333,
    coverImage: "https://via.placeholder.com/40x40/db2777/ffffff?text=VT",
    posicaoAnterior: 3
  },
  { 
    _id: "produto4", 
    title: "Criação de Conteúdo", 
    valor: "R$ 197,00", 
    vendas: 67, 
    faturamento: 13199,
    coverImage: "https://via.placeholder.com/40x40/ea580c/ffffff?text=CC",
    posicaoAnterior: 4
  },
];

// ================= TOOLTIP CUSTOM =================
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;
  const day = payload[0].payload.day;

  return (
    <div className="bg-[#1A212F] border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{day}</p>
      <p className="text-base font-semibold text-white">
        R$ {Number(value).toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

function Dashboard() {
  usePageTitle("Dashboard");

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const chartData = useMemo(() => generateLast30Days(), []);

  const visibleDays = chartData
    .filter((_, index) => index % 3 === 0)
    .map((d) => d.day);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Calcular totais
  const totalFaturamento = produtosData.reduce((acc, p) => acc + p.faturamento, 0);
  const totalVendas = produtosData.reduce((acc, p) => acc + p.vendas, 0);

  // Ordenar produtos por vendas para ranking
  const produtosOrdenados = [...produtosData].sort((a, b) => b.vendas - a.vendas);
  
  // Identificar produto destaque (mais vendas)
  const produtoDestaque = produtosOrdenados[0];

  // Calcular variação de posição para cada produto
  const produtosComVariacao = produtosOrdenados.map((produto, index) => {
    const posicaoAtual = index + 1;
    const posicaoAnterior = produto.posicaoAnterior || posicaoAtual;
    
    let variacao = null;
    let percentual = null;
    
    if (posicaoAnterior < posicaoAtual) {
      variacao = 'down';
      percentual = Math.round(((posicaoAtual - posicaoAnterior) / posicaoAnterior) * 100);
    } else if (posicaoAnterior > posicaoAtual) {
      variacao = 'up';
      percentual = Math.round(((posicaoAnterior - posicaoAtual) / posicaoAtual) * 100);
    } else {
      variacao = 'stable';
    }
    
    return { ...produto, posicaoAtual, variacao, percentual };
  });

  // Filtrar produtos baseado no termo de busca
  const filteredProdutos = produtosComVariacao.filter(produto =>
    produto.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular lucro percentual (mock)
  const lucroPercentual = 12.5;

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Visão geral do seu negócio</p>
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Busca de produtos */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 placeholder-gray-500 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Filtro de data */}
          <div className="flex items-center gap-2">
            <FiCalendar className="text-gray-500" size={18} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 px-3 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="60">Últimos 60 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="custom">Personalizado</option>
            </select>

            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <span className="text-gray-500">até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#1A212F] border border-gray-700 text-gray-200 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Gráfico */}
        <div className="relative bg-[#141A26] border border-gray-800 rounded-lg p-6 mb-8">
          {/* Mensagens */}
          <div className="absolute top-6 left-6 flex gap-4 z-10">
            <div className="bg-[#1A212F] border border-gray-700 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-400">Hoje é {today}</p>
              <p className="text-sm text-white mt-0.5">Olá, Sokacheski 👋</p>
            </div>
            <div className="bg-[#1A212F] border border-gray-700 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-400">Saldo disponível</p>
              <p className="text-sm font-medium text-white mt-0.5">R$ 2.437,90</p>
            </div>
          </div>

          {/* Indicador de lucro */}
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#1A212F] border border-gray-700 rounded-lg px-3 py-2">
            <FiTrendingUp className="text-green-400" size={14} />
            <span className="text-sm font-medium text-green-400">+{lucroPercentual}%</span>
          </div>

          {loading ? (
            <div className="h-[300px] bg-[#1A212F] animate-pulse rounded-lg" />
          ) : (
            <div className="h-[300px] mt-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#1F2937" 
                    vertical={true}
                    horizontal={true}
                    strokeOpacity={0.2}
                  />

                  <XAxis 
                    dataKey="day" 
                    stroke="#4B5563" 
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    tickFormatter={(day) => visibleDays.includes(day) ? day : ""}
                    axisLine={{ stroke: '#374151' }}
                    tickLine={{ stroke: '#374151' }}
                  />

                  {/* YAxis sem ticks de valor */}
                  <YAxis 
                    stroke="#4B5563"
                    tick={false}
                    axisLine={{ stroke: '#374151' }}
                    tickLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ r: 2, fill: "#2563EB", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Cards de destaque */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1 - Produto Destaque (Azul escuro neon) */}
          <div className="col-span-1 relative overflow-hidden">
            {/* Efeito neon */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />
            
            <div className="relative bg-[#0A1428] border border-blue-700/50 rounded-lg p-5 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <FiAward className="text-blue-400" size={18} />
                </div>
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Produto Destaque</span>
              </div>
              <p className="text-sm text-white font-medium truncate">{produtoDestaque?.title}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <span className="text-xs text-gray-500">Vendas</span>
                  <p className="text-sm text-white mt-1">{produtoDestaque?.vendas}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Faturamento</span>
                  <p className="text-sm text-white mt-1">R$ {produtoDestaque?.faturamento.toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-800/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Participação</span>
                  <span className="text-sm text-blue-400 font-medium">
                    {Math.round((produtoDestaque?.vendas || 0) / totalVendas * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Total de Vendas */}
          <div className="col-span-1 bg-[#141A26] border border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FiBarChart2 className="text-blue-400" size={18} />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Vendas</span>
            </div>
            <p className="text-2xl font-semibold text-white">{totalVendas}</p>
            <p className="text-xs text-gray-500 mt-2">Total do período</p>
          </div>

          {/* Card 3 - Faturamento Total */}
          <div className="col-span-1 bg-[#141A26] border border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FiTrendingUp className="text-green-400" size={18} />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Faturamento</span>
            </div>
            <p className="text-2xl font-semibold text-white">R$ {totalFaturamento.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-500 mt-2">Total do período</p>
          </div>

          {/* Card 4 - Crescimento */}
          <div className="col-span-1 bg-[#141A26] border border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FiTrendingUp className="text-purple-400" size={18} />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Crescimento</span>
            </div>
            <p className="text-2xl font-semibold text-green-400">+{lucroPercentual}%</p>
            <p className="text-xs text-gray-500 mt-2">vs. período anterior</p>
          </div>
        </div>

        {/* Produtos mais vendidos */}
        <div className="bg-[#141A26] border border-gray-800 rounded-lg overflow-hidden">
          {/* Cabeçalho com métricas */}
          <div className="px-6 py-4 border-b border-gray-800 bg-[#0F1320]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiBarChart2 className="text-blue-400" size={18} />
                <div>
                  <h2 className="text-sm font-medium text-white">Produtos mais vendidos</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Ranking por volume de vendas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cabeçalho da tabela - Alinhado profissionalmente */}
          <div className="px-6 py-3 border-b border-gray-800 bg-[#0F1320]">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Variação</span>
              </div>
            </div>
          </div>

          {/* Tabela de produtos */}
          <div className="p-6 pt-4">
            {filteredProdutos.length > 0 ? (
              <div className="space-y-3">
                {filteredProdutos.map((produto) => (
                  <div
                    key={produto._id}
                    className="grid grid-cols-12 gap-4 items-center p-3 bg-[#1A212F] rounded-lg hover:bg-[#232B3B] transition-all duration-200 group"
                  >
                    {/* Produto (Preview + Info) - 6 colunas */}
                    <div className="col-span-6 flex items-center gap-4">
                      {/* Preview */}
                      <div className="flex-shrink-0">
                        {produto.coverImage ? (
                          <img
                            src={produto.coverImage}
                            alt={produto.title}
                            className="w-12 h-12 rounded object-cover bg-gray-800"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center text-gray-600">
                            {produto.title.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-600">
                            {produto._id.slice(0, 8)}...
                          </span>
                          <FiChevronRight className="h-3 w-3 text-gray-700" />
                          <h3 className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                            {produto.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {produto.valor}
                        </p>
                      </div>
                    </div>

                    {/* Vendas - 2 colunas */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm text-white">{produto.vendas}</p>
                    </div>

                    {/* Faturamento - 2 colunas */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm text-white">R$ {produto.faturamento.toLocaleString('pt-BR')}</p>
                    </div>

                    {/* Variação - 2 colunas */}
                    <div className="col-span-2 text-right">
                      {produto.variacao === 'up' && (
                        <div className="flex items-center justify-end gap-1">
                          <FiTrendingUp className="text-green-400" size={14} />
                          <span className="text-xs text-green-400">+{produto.percentual}%</span>
                        </div>
                      )}
                      {produto.variacao === 'down' && (
                        <div className="flex items-center justify-end gap-1">
                          <FiTrendingDown className="text-red-400" size={14} />
                          <span className="text-xs text-red-400">-{produto.percentual}%</span>
                        </div>
                      )}
                      {produto.variacao === 'stable' && (
                        <div className="flex items-center justify-end">
                          <FiMinus className="text-gray-600" size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Nenhum produto encontrado para "{searchTerm}"
              </div>
            )}
          </div>

          {/* Rodapé com estatísticas */}
          <div className="px-6 py-3 bg-[#0F1320] border-t border-gray-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Exibindo {filteredProdutos.length} de {produtosData.length} produtos
              </span>
              <span className="text-gray-500">
                Atualizado em {new Date().toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;