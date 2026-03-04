
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ProductionOrder, OrderStatus, Priority, ProductionSector, ProductionSubSector, SystemUser } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  AlertOctagon, 
  CalendarDays, 
  Filter, 
  Factory, 
  LayoutGrid, 
  X,
  Activity,
  Zap,
  BarChart3,
  UserCircle,
  ChevronDown,
  Check,
  XCircle,
  RotateCcw,
  Scale,
  Weight,
  History
} from 'lucide-react';

interface Props {
  orders: ProductionOrder[];
  sectors: ProductionSector[];
  subSectors: ProductionSubSector[];
  users: SystemUser[];
}

const DashboardView: React.FC<Props> = ({ orders, sectors, subSectors, users }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<string[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  
  const [activeDropdown, setActiveDropdown] = useState<'sector' | 'subsector' | 'creator' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = useMemo(() => {
    const uniqueYears = new Set(orders.map(o => new Date(o.createdAt).getFullYear()));
    uniqueYears.add(currentYear);
    return Array.from(uniqueYears).sort((a: number, b: number) => b - a);
  }, [orders, currentYear]);

  const availableUsers = useMemo(() => {
    return users.map(u => u.name).sort();
  }, [users]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelection = (list: string[], setList: (val: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const date = new Date(o.createdAt);
      const monthMatch = selectedMonth === -1 ? true : date.getMonth() === selectedMonth;
      const yearMatch = date.getFullYear() === selectedYear;
      if (!monthMatch || !yearMatch) return false;

      const sectorMatch = selectedSectors.length > 0 ? selectedSectors.includes(o.sector) : true;
      const subSectorMatch = selectedSubSectors.length > 0 ? (o.subSector && selectedSubSectors.includes(o.subSector)) : true;
      const creatorMatch = selectedCreators.length > 0 ? (o.createdBy && selectedCreators.includes(o.createdBy)) : true;
      
      return sectorMatch && subSectorMatch && creatorMatch;
    });
  }, [orders, selectedMonth, selectedYear, selectedSectors, selectedSubSectors, selectedCreators]);

  const stats = useMemo(() => {
    return {
      total: filteredOrders.length,
      pending: filteredOrders.filter(o => o.status === OrderStatus.PENDING).length,
      inProgress: filteredOrders.filter(o => o.status === OrderStatus.IN_PROGRESS).length,
      completed: filteredOrders.filter(o => o.status === OrderStatus.COMPLETED).length,
      urgent: filteredOrders.filter(o => o.priority === Priority.URGENT && o.status !== OrderStatus.COMPLETED).length,
      delayed: filteredOrders.filter(o => {
        if (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED) return false;
        const today = new Date(); today.setHours(0,0,0,0);
        const deadlineDate = new Date(o.deadline); deadlineDate.setHours(0,0,0,0);
        return deadlineDate < today;
      }).length
    };
  }, [filteredOrders]);

  const statusData = useMemo(() => [
    { name: 'Pendente', value: stats.pending, color: '#94a3b8' },
    { name: 'Em Produção', value: stats.inProgress, color: '#FFB800' },
    { name: 'Concluído', value: stats.completed, color: '#002855' }
  ].filter(d => d.value > 0), [stats]);

  const priorityData = useMemo(() => [
    { name: 'URGENTE', count: stats.urgent, color: '#ef4444' },
    { name: 'ALTA', count: filteredOrders.filter(o => o.priority === Priority.HIGH).length, color: '#002855' },
    { name: 'MÉDIA', count: filteredOrders.filter(o => o.priority === Priority.MEDIUM).length, color: '#FFB800' },
    { name: 'BAIXA', count: filteredOrders.filter(o => o.priority === Priority.LOW).length, color: '#cbd5e1' }
  ], [stats, filteredOrders]);

  const clearAllFilters = () => {
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedCreators([]);
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setActiveDropdown(null);
  };

  const hasActiveFilters = selectedSectors.length > 0 || 
                           selectedSubSectors.length > 0 || 
                           selectedCreators.length > 0 || 
                           selectedMonth !== currentMonth || 
                           selectedYear !== currentYear;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER E FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-1 bg-[#FFB800] rounded-full"></div>
             <h2 className="text-2xl font-black text-[#002855] italic uppercase tracking-tighter">
               Monitoramento em Tempo Real
             </h2>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Linha de Produção SÓ AÇO</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-[1.5rem] border border-slate-200 shadow-sm relative" ref={dropdownRef}>
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <CalendarDays className="w-4 h-4 text-[#002855]" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent border-none text-[10px] font-black uppercase text-[#002855] outline-none cursor-pointer focus:ring-0"
            >
              <option value={-1}>TODOS OS MESES</option>
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent border-none text-[10px] font-black uppercase text-[#002855] outline-none cursor-pointer focus:ring-0"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="relative px-3 border-r border-slate-100">
            <button onClick={() => setActiveDropdown(activeDropdown === 'sector' ? null : 'sector')} className="flex items-center gap-2 text-[9px] font-black uppercase text-[#002855] hover:text-[#FFB800] transition-colors">
              <Factory className="w-4 h-4 text-[#FFB800]" /> SETOR {selectedSectors.length > 0 ? `(${selectedSectors.length})` : ''}
              <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'sector' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'sector' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {sectors.map(s => (
                    <button key={s.id} onClick={() => toggleSelection(selectedSectors, setSelectedSectors, s.name)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left">
                      <span className="text-[10px] font-black text-[#002855] uppercase">{s.name}</span>
                      {selectedSectors.includes(s.name) && <Check className="w-3 h-3 text-[#FFB800] stroke-[4]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="ml-2 flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all text-[10px] font-black uppercase shadow-lg active:scale-95 animate-in slide-in-from-right-2">
              <RotateCcw className="w-4 h-4" /> Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard icon={<FileText />} label="Ordens Registradas" value={stats.total} theme="dark" />
        <StatCard icon={<Zap />} label="Em Produção" value={stats.inProgress} theme="warning" />
        <StatCard icon={<CheckCircle />} label="Concluídas" value={stats.completed} theme="success" />
        <StatCard icon={<AlertTriangle />} label="Urgentes" value={stats.urgent} theme="danger" />
        <StatCard icon={<AlertOctagon />} label="Atrasadas" value={stats.delayed} theme={stats.delayed > 0 ? "critical" : "neutral"} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#FFB800]" />
                  <h3 className="text-sm font-black text-[#002855] uppercase tracking-widest italic">Mix de Produção</h3>
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Status Geral</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#002855]" />
                  <h3 className="text-sm font-black text-[#002855] uppercase tracking-widest italic">Demanda por Prioridade</h3>
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Carga Máxima</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={35}>
                      {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#002855] rounded-[2.5rem] shadow-2xl overflow-hidden border-b-8 border-[#FFB800] flex flex-col h-[500px]">
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#FFB800] rounded-full animate-pulse"></div>
              <h3 className="text-white text-sm font-black uppercase tracking-widest italic">Fluxo da Linha</h3>
            </div>
            <span className="text-[8px] font-black text-[#FFB800]/60 uppercase tracking-[0.2em]">Live Feed</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-8 custom-scrollbar">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <Activity className="w-12 h-12 text-white mx-auto mb-4" />
                <p className="text-white text-[10px] font-black uppercase">Vazio...</p>
              </div>
            ) : (
              filteredOrders.slice(0, 15).map((order, idx) => {
                return (
                  <div key={order.id} className="p-4 rounded-2xl border transition-all hover:translate-x-1 bg-white/5 border-white/10 hover:bg-white/10">
                    <div className="flex items-start justify-between mb-2">
                       <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-[#FFB800] text-[#002855]">
                         {idx + 1}
                       </span>
                       <span className="text-[8px] font-black uppercase text-slate-400">
                         {order.status}
                       </span>
                    </div>
                    <h4 className="text-white text-[11px] font-black uppercase truncate italic">{order.productName}</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] text-white/40 font-bold truncate max-w-[120px]">{order.clientName}</span>
                      <span className="text-[9px] font-black text-white/60">
                        {new Date(order.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, theme }: { icon: React.ReactNode, label: string, value: any, theme: 'dark' | 'warning' | 'success' | 'danger' | 'critical' | 'neutral' }) => {
  const themes = {
    dark: 'bg-[#002855] text-white border-[#001a35]',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    critical: 'bg-red-600 text-white border-red-700 animate-pulse',
    neutral: 'bg-slate-50 text-slate-400 border-slate-100'
  };

  const iconColors = {
    dark: 'text-[#FFB800]',
    warning: 'text-amber-500',
    success: 'text-emerald-500',
    danger: 'text-rose-500',
    critical: 'text-white',
    neutral: 'text-slate-300'
  };

  return (
    <div className={`p-6 rounded-[2rem] border shadow-sm transition-all hover:shadow-md flex flex-col items-center justify-center text-center gap-3 ${themes[theme]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-white shadow-inner'} ${iconColors[theme]}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </div>
      <div>
        <p className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
          {label}
        </p>
        <p className="text-3xl font-black mt-0.5 tracking-tighter tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
};

export default DashboardView;
