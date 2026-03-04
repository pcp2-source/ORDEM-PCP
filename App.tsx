import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Search,
  Menu,
  X,
  Loader2,
  BrainCircuit,
  Settings,
  Table as TableIcon,
  Factory,
  UserCheck,
  Scale,
  Compass,
  History as HistoryIcon,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

// Importação de Tipos
import { 
  ProductionOrder, 
  OrderStatus, 
  Priority, 
  SystemUser, 
  SystemConfig, 
  ProductionSector, 
  ProductionSubSector, 
  AuditEntry, 
  SheetMaterial, 
  TubeRoundMaterial, 
  MetalonSquareMaterial, 
  MetalonRectMaterial, 
  LoadHistoryEntry, 
  EngineeringPart 
} from './types';

// CORREÇÃO DAS IMPORTAÇÕES: Apontando para a pasta ./components/
import DashboardView from './components/DashboardView';
import OrderFormView from './components/OrderFormView';
import OrderListView from './components/OrderListView';
import PieceOrderFormView from './components/PieceOrderFormView';
import SettingsView from './components/SettingsView';
import WeightCalculatorView from './components/WeightCalculatorView';
import EngineeringRegistryView from './components/EngineeringRegistryView';
import HistoryView from './components/HistoryView';

// Importação de Serviços
import { analyzeProduction } from './services/geminiService';

const SoAcoLogo = ({ light = false, large = false }) => (
  <div className="flex items-center gap-2 select-none">
    <div className={`flex items-baseline font-black italic tracking-tighter ${large ? 'text-5xl' : 'text-2xl'}`}>
      <span className="text-[#FFB800]">SÓ</span>
      <span className={light ? "text-white ml-1" : "text-[#002855] ml-1"}>AÇO</span>
    </div>
    <div className={`${large ? 'w-4 h-4' : 'w-2 h-2'} rounded-full bg-[#FFB800] mt-2 animate-pulse`}></div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'new-order' | 'piece-order' | 'weight-calc' | 'eng-registry' | 'history' | 'settings'>('dashboard');
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loadHistory, setLoadHistory] = useState<LoadHistoryEntry[]>([]);
  const [library, setLibrary] = useState<EngineeringPart[]>([]);
  
  const [replicateOrderData, setReplicateOrderData] = useState<ProductionOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [activeUser, setActiveUser] = useState<SystemUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [sectors, setSectors] = useState<ProductionSector[]>([]);
  const [subSectors, setSubSectors] = useState<ProductionSubSector[]>([]);
  const [sheets, setSheets] = useState<SheetMaterial[]>([]);
  const [tubesRound, setTubesRound] = useState<TubeRoundMaterial[]>([]);
  const [tubesSquare, setTubesSquare] = useState<MetalonSquareMaterial[]>([]);
  const [tubesRect, setTubesRect] = useState<MetalonRectMaterial[]>([]);
  
  const [config, setConfig] = useState<SystemConfig>({ 
    contacts: [{ id: '1', label: 'Principal', number: '5586994703472' }],
    settingsPassword: ''
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [loginUserId, setLoginUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [settingsUnlockInput, setSettingsUnlockInput] = useState('');

  const [setupMode, setSetupMode] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupPass, setSetupPass] = useState('');

  const MASTER_PASSWORD = '104210';

  useEffect(() => {
    const savedOrders = localStorage.getItem('prod_orders');
    const savedHistory = localStorage.getItem('sa_load_history');
    const savedLibrary = localStorage.getItem('sa_eng_library');
    const savedUsers = localStorage.getItem('sa_users');
    const savedSectors = localStorage.getItem('sa_sectors');
    const savedSubSectors = localStorage.getItem('sa_subsectors');
    const savedSheets = localStorage.getItem('sa_sheets');
    const savedTubesRound = localStorage.getItem('sa_tubes_round');
    const savedTubesSquare = localStorage.getItem('sa_tubes_square');
    const savedTubesRect = localStorage.getItem('sa_tubes_rect');
    const savedConfig = localStorage.getItem('sa_config_v2');
    
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedHistory) setLoadHistory(JSON.parse(savedHistory));
    if (savedLibrary) setLibrary(JSON.parse(savedLibrary));
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      if (parsedUsers.length === 0) setSetupMode(true);
    } else {
      setSetupMode(true);
    }
    
    if (savedSectors) setSectors(JSON.parse(savedSectors));
    if (savedSubSectors) setSubSectors(JSON.parse(savedSubSectors));
    if (savedSheets) setSheets(JSON.parse(savedSheets));
    if (savedTubesRound) setTubesRound(JSON.parse(savedTubesRound));
    if (savedTubesSquare) setTubesSquare(JSON.parse(savedTubesSquare));
    if (savedTubesRect) setTubesRect(JSON.parse(savedTubesRect));
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  useEffect(() => { localStorage.setItem('prod_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('sa_load_history', JSON.stringify(loadHistory)); }, [loadHistory]);
  useEffect(() => { localStorage.setItem('sa_eng_library', JSON.stringify(library)); }, [library]);
  useEffect(() => { localStorage.setItem('sa_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('sa_sectors', JSON.stringify(sectors)); }, [sectors]);
  useEffect(() => { localStorage.setItem('sa_subsectors', JSON.stringify(subSectors)); }, [subSectors]);
  useEffect(() => { localStorage.setItem('sa_sheets', JSON.stringify(sheets)); }, [sheets]);
  useEffect(() => { localStorage.setItem('sa_tubes_round', JSON.stringify(tubesRound)); }, [tubesRound]);
  useEffect(() => { localStorage.setItem('sa_tubes_square', JSON.stringify(tubesSquare)); }, [tubesSquare]);
  useEffect(() => { localStorage.setItem('sa_tubes_rect', JSON.stringify(tubesRect)); }, [tubesRect]);
  useEffect(() => { localStorage.setItem('sa_config_v2', JSON.stringify(config)); }, [config]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = users.find(u => u.id === loginUserId);
    if (user && user.password === loginPassword) {
      setActiveUser(user);
      setIsLoggedIn(true);
      setLoginPassword('');
    } else {
      setLoginError('Senha incorreta ou usuário não selecionado.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveUser(null);
    setLoginUserId('');
    setIsSettingsUnlocked(false);
  };

  const handleSettingsUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = settingsUnlockInput === MASTER_PASSWORD || 
                      (config.settingsPassword && settingsUnlockInput === config.settingsPassword);
    
    if (isCorrect) {
      setIsSettingsUnlocked(true);
      setSettingsUnlockInput('');
    } else {
      alert("Acesso Negado: Senha Incorreta.");
    }
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName || !setupPass) return;
    const admin: SystemUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: setupName.toUpperCase(),
      role: 'Administrador',
      password: setupPass
    };
    setUsers([admin]);
    setActiveUser(admin);
    setIsLoggedIn(true);
    setSetupMode(false);
  };

  const createLog = (action: string, details: string): AuditEntry => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    userName: activeUser?.name || 'Sistema',
    action,
    details
  });

  const addOrder = (newOrder: ProductionOrder, notify: boolean) => {
    const orderWithHistory = {
      ...newOrder,
      createdBy: activeUser?.name || 'SISTEMA',
      createdByRole: activeUser?.role || 'SISTEMA',
      history: [createLog('Criação', `Ordem registrada por ${activeUser?.name || 'Sistema'}`)]
    };
    setOrders(prev => [orderWithHistory, ...prev]);
    setReplicateOrderData(null);
    if (notify) sendWhatsAppNotification(orderWithHistory);
    setActiveTab('orders');
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const log = createLog('Mudança de Status', `De ${o.status} para ${status}`);
        return { ...o, status, history: [log, ...o.history] };
      }
      return o;
    }));
  };

  const deleteOrder = (id: string) => {
    if (window.confirm('Deseja excluir permanentemente esta ordem?')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleReplicate = (order: ProductionOrder) => {
    setReplicateOrderData(order);
    if (order.items && order.items.length > 0) setActiveTab('piece-order');
    else setActiveTab('new-order');
  };

  const sendWhatsAppNotification = (order: ProductionOrder) => {
    if (config.contacts.length === 0) {
      alert("Aviso: Nenhum número de WhatsApp cadastrado nas configurações.");
      return;
    }
    const creationDate = new Date(order.createdAt).toLocaleDateString('pt-BR');
    const deadlineDate = new Date(order.deadline).toLocaleDateString('pt-BR');
    let text = `*SÓ AÇO - NOVA ORDEM DE PRODUÇÃO*\n` +
               `------------------------------------------\n` +
               `📦 *ID:* ${order.id}\n` +
               `📅 *Data Emissão:* ${creationDate}\n` +
               `🏢 *Setor:* ${order.sector}\n` +
               (order.subSector ? `🏗️ *Sub-setor:* ${order.subSector}\n` : '') +
               `👤 *Cliente:* ${order.clientName}\n` +
               `🛠️ Produto: ${order.productName}\n` +
               `🔢 *Quantidade:* ${order.quantity} ${order.unit}\n` +
               `🏁 *Prazo Entrega:* ${deadlineDate}\n` +
               `👤 *Criado por:* ${order.createdBy || 'Sistema'}\n\n` +
               `📝 *OBSERVAÇÕES TÉCNICAS:*\n` +
               `${order.notes && order.notes.trim() !== "" ? `_${order.notes.trim()}_` : '---'}\n\n` +
               `🔥 *PRIORIDADE:* ${order.priority.toUpperCase()}\n` +
               `------------------------------------------\n` +
               `_Enviado via Gestão SÓ AÇO_`;

    config.contacts.forEach((contact, index) => {
      const pureNumber = contact.number.replace(/\D/g, '');
      const url = `https://wa.me/${pureNumber}?text=${encodeURIComponent(text)}`;
      setTimeout(() => { window.open(url, '_blank'); }, index * 800);
    });
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    const insight = await analyzeProduction(orders);
    setAiInsight(insight);
    setIsAnalyzing(false);
  };

  if (setupMode) {
    return (
      <div className="min-h-screen bg-[#001a35] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFB800] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-12 relative z-10 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-10">
            <SoAcoLogo large />
            <h1 className="text-xl font-black text-[#002855] uppercase mt-6 italic tracking-tight text-center">Configuração de Primeiro Acesso</h1>
            <p className="text-slate-400 font-bold text-center text-sm mt-2">Cadastre o administrador do sistema.</p>
          </div>
          <form onSubmit={handleSetup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
              <input required type="text" value={setupName} onChange={e => setSetupName(e.target.value)} placeholder="EX: ENCARREGADO GERAL" className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] outline-none focus:border-[#FFB800] uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha Mestra</label>
              <input required type="password" value={setupPass} onChange