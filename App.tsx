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

import DashboardView from './components/DashboardView';
import OrderFormView from './components/OrderFormView';
import OrderListView from './components/OrderListView';
import PieceOrderFormView from './components/PieceOrderFormView';
import SettingsView from './components/SettingsView';
import WeightCalculatorView from './components/WeightCalculatorView';
import EngineeringRegistryView from './components/EngineeringRegistryView';
import HistoryView from './components/HistoryView';

import { analyzeProduction } from './services/geminiService';

// ============================================
// ✅ FUNÇÕES SEGURAS DE LOCALSTORAGE
// ============================================

const getLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
  } catch (error) {
    console.error(`Erro ao ler localStorage (${key}):`, error);
  }
  return defaultValue;
};

const setLocalStorage = (key: string, value: any) => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Erro ao salvar localStorage (${key}):`, error);
  }
};

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

  // ============================================
  // ✅ CARREGAMENTO SEGURO DO LOCALSTORAGE
  // ============================================
  useEffect(() => {
    const savedOrders = getLocalStorage('prod_orders', null);
    const savedHistory = getLocalStorage('sa_load_history', null);
    const savedLibrary = getLocalStorage('sa_eng_library', null);
    const savedUsers = getLocalStorage('sa_users', null);
    const savedSectors = getLocalStorage('sa_sectors', null);
    const savedSubSectors = getLocalStorage('sa_subsectors', null);
    const savedSheets = getLocalStorage('sa_sheets', null);
    const savedTubesRound = getLocalStorage('sa_tubes_round', null);
    const savedTubesSquare = getLocalStorage('sa_tubes_square', null);
    const savedTubesRect = getLocalStorage('sa_tubes_rect', null);
    const savedConfig = getLocalStorage('sa_config_v2', null);
    
    if (savedOrders) setOrders(savedOrders);
    if (savedHistory) setLoadHistory(savedHistory);
    if (savedLibrary) setLibrary(savedLibrary);
    if (savedUsers) {
      setUsers(savedUsers);
      if (savedUsers.length === 0) setSetupMode(true);
    } else {
      setSetupMode(true);
    }
    
    if (savedSectors) setSectors(savedSectors);
    if (savedSubSectors) setSubSectors(savedSubSectors);
    if (savedSheets) setSheets(savedSheets);
    if (savedTubesRound) setTubesRound(savedTubesRound);
    if (savedTubesSquare) setTubesSquare(savedTubesSquare);
    if (savedTubesRect) setTubesRect(savedTubesRect);
    if (savedConfig) setConfig(savedConfig);
  }, []);

  // ============================================
  // ✅ SALVAMENTO SEGURO NO LOCALSTORAGE
  // ============================================
  useEffect(() => { setLocalStorage('prod_orders', orders); }, [orders]);
  useEffect(() => { setLocalStorage('sa_load_history', loadHistory); }, [loadHistory]);
  useEffect(() => { setLocalStorage('sa_eng_library', library); }, [library]);
  useEffect(() => { setLocalStorage('sa_users', users); }, [users]);
  useEffect(() => { setLocalStorage('sa_sectors', sectors); }, [sectors]);
  useEffect(() => { setLocalStorage('sa_subsectors', subSectors); }, [subSectors]);
  useEffect(() => { setLocalStorage('sa_sheets', sheets); }, [sheets]);
  useEffect(() => { setLocalStorage('sa_tubes_round', tubesRound); }, [tubesRound]);
  useEffect(() => { setLocalStorage('sa_tubes_square', tubesSquare); }, [tubesSquare]);
  useEffect(() => { setLocalStorage('sa_tubes_rect', tubesRect); }, [tubesRect]);
  useEffect(() => { setLocalStorage('sa_config_v2', config); }, [config]);

  const addOrder = (order: ProductionOrder, notify: boolean) => {
    setOrders([...orders, order]);
    if (notify) sendWhatsAppNotification(order);
    setReplicateOrderData(null);
    setActiveTab('dashboard');
  };

  const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const deleteOrder = (id: string) => {
    if (confirm('Tem certeza que deseja deletar essa ordem?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const sendWhatsAppNotification = (order: ProductionOrder) => {
    const phoneNumber = config.contacts[0]?.number || '5586994703472';
    const message = `*SÓ AÇO - Nova Ordem de Produção*\n\nID: ${order.id}\nCliente: ${order.clientName}\nProduto: ${order.productName}\nPrazo: ${new Date(order.deadline).toLocaleDateString('pt-BR')}\nPrioridade: ${order.priority}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleReplicate = (order: ProductionOrder) => {
    setReplicateOrderData(order);
    if (order.items && order.items.length > 0) {
      setActiveTab('piece-order');
    } else {
      setActiveTab('new-order');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === loginUserId && u.password === loginPassword);
    
    if (user) {
      setActiveUser(user);
      setIsLoggedIn(true);
      setLoginError('');
      setLoginPassword('');
    } else {
      setLoginError('Usuário ou senha inválidos');
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    setIsLoggedIn(false);
    setLoginUserId('');
    setLoginPassword('');
    setActiveTab('dashboard');
  };

  const handleSettingsUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsUnlockInput === MASTER_PASSWORD) {
      setIsSettingsUnlocked(true);
      setSettingsUnlockInput('');
    } else {
      alert('Senha incorreta');
      setSettingsUnlockInput('');
    }
  };

  const runAiAnalysis = async () => {
    if (orders.length === 0) {
      alert('Nenhuma ordem para analisar');
      return;
    }

    setIsAnalyzing(true);
    try {
      const insight = await analyzeProduction(orders, users);
      setAiInsight(insight);
    } catch (error) {
      alert('Erro na análise: ' + error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSetupUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName || !setupPass) {
      alert('Preencha todos os campos');
      return;
    }

    const newUser: SystemUser = {
      id: setupName,
      name: setupName,
      password: setupPass,
      role: 'Administrador',
      createdAt: new Date().toISOString()
    };

    setUsers([newUser]);
    setActiveUser(newUser);
    setIsLoggedIn(true);
    setSetupMode(false);
  };

  if (!isLoggedIn && !setupMode) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-[#002855] to-[#001428] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4 mb-12">
            <SoAcoLogo light large />
            <div>
              <h1 className="text-4xl font-black text-white italic tracking-tighter">SÓ AÇO</h1>
              <p className="text-[#FFB800] text-[11px] font-black uppercase tracking-[0.3em] mt-2">Sistema de Produção</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-2 border-[#FFB800]/20 space-y-6">
            <div>
              <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest mb-3 block ml-1 flex items-center gap-2">
                <LogIn className="w-4 h-4 text-[#FFB800]" /> Acesso de Usuário
              </label>
              <input 
                type="text"
                value={loginUserId}
                onChange={e => setLoginUserId(e.target.value)}
                placeholder="ID do Usuário"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest mb-3 block ml-1 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#FFB800]" /> Senha
              </label>
              <div className="relative">
                <input 
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Senha de Acesso"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855]"
                />
                <button 
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002855]"
                >
                  {showLoginPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-[11px] font-black uppercase tracking-widest flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" /> {loginError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-[#002855] text-[#FFB800] font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-xl hover:bg-[#001a35] transition-all"
            >
              Acessar Sistema
            </button>
          </form>

          <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Sistema Protegido de Produção
          </p>
        </div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-[#002855] to-[#001428] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-4 mb-12">
            <SoAcoLogo light large />
            <div>
              <h1 className="text-4xl font-black text-white italic tracking-tighter">SÓ AÇO</h1>
              <p className="text-[#FFB800] text-[11px] font-black uppercase tracking-[0.3em] mt-2">Primeiro Acesso</p>
            </div>
          </div>

          <form onSubmit={handleSetupUser} className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-2 border-[#FFB800]/20 space-y-6">
            <p className="text-[10px] font-bold text-slate-500 text-center">Configure o primeiro usuário do sistema</p>
            
            <input 
              type="text"
              value={setupName}
              onChange={e => setSetupName(e.target.value)}
              placeholder="Nome de Usuário"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855]"
            />

            <input 
              type="password"
              value={setupPass}
              onChange={e => setSetupPass(e.target.value)}
              placeholder="Senha"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855]"
            />

            <button 
              type="submit"
              className="w-full py-5 bg-[#002855] text-[#FFB800] font-black uppercase text-[11px] rounded-2xl shadow-xl hover:bg-[#001a35] transition-all"
            >
              Criar Usuário
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-[#002855] text-white transition-all duration-500 flex flex-col overflow-hidden border-r border-white/10`}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3 justify-between">
          {isSidebarOpen && <SoAcoLogo light />}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          <NavItem icon={<LayoutDashboard />} label="Painel Geral" active={activeTab === 'dashboard'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<ListTodo />} label="Ordens (Prod)" active={activeTab === 'orders'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('orders')} />
          <NavItem icon={<PlusCircle />} label="Nova OP" active={activeTab === 'new-order'} collapsed={!isSidebarOpen} onClick={() => { setReplicateOrderData(null); setActiveTab('new-order'); }} />
          <NavItem icon={<TableIcon />} label="Detalhamento" active={activeTab === 'piece-order'} collapsed={!isSidebarOpen} onClick={() => { setReplicateOrderData(null); setActiveTab('piece-order'); }} />
          <NavItem icon={<Scale />} label="Cálculo de Peso" active={activeTab === 'weight-calc'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('weight-calc')} />
          <NavItem icon={<Compass />} label="Cadastro ENG" active={activeTab === 'eng-registry'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('eng-registry')} />
          <NavItem icon={<HistoryIcon />} label="Histórico Carga" active={activeTab === 'history'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('history')} />
          <div className="py-2"><div className={`h-px bg-white/10 mb-2 ${!isSidebarOpen && 'mx-4'}`}></div></div>
          <NavItem icon={<Settings />} label="Configurações" active={activeTab === 'settings'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#001328] space-y-2">
          <button onClick={runAiAnalysis} disabled={isAnalyzing} className={`w-full flex items-center gap-3 p-3 rounded-xl bg-[#FFB800]/10 hover:bg-[#FFB800]/20 transition-all text-[#FFB800] font-bold border border-[#FFB800]/20 ${!isSidebarOpen && 'justify-center'}`}>
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            {isSidebarOpen && <span>Analista IA</span>}
          </button>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all font-bold border border-rose-500/20 ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Sair / Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Pesquisar por ID, Cliente, Produto ou Notas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#002855] outline-none transition-all" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="h-10 w-px bg-slate-100 mx-2 hidden md:block"></div>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-inner group">
              <UserCheck className="w-4 h-4 text-[#002855]" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sessão Ativa</span>
                <span className="text-[11px] font-black text-[#002855] uppercase">{activeUser?.name || 'SISTEMA'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#002855]">Unidade SÓ AÇO</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{activeUser?.role || 'Visitante'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#002855] flex items-center justify-center text-white font-black border-2 border-[#FFB800]">
                {activeUser?.name?.substring(0,2).toUpperCase() || 'SA'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          {aiInsight && (
            <div className="mb-8 p-6 bg-[#002855]/5 border-l-4 border-[#FFB800] rounded-r-2xl relative shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#002855] font-black flex items-center gap-2 italic uppercase text-sm">
                  <BrainCircuit className="w-4 h-4 text-[#FFB800]" /> Insight SÓ AÇO
                </h3>
                <button onClick={() => setAiInsight(null)} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-[#002855] text-sm leading-relaxed whitespace-pre-wrap font-medium">{aiInsight}</p>
            </div>
          )}

          {activeTab === 'dashboard' && <DashboardView orders={orders} sectors={sectors} subSectors={subSectors} users={users} />}
          {activeTab === 'orders' && (
            <OrderListView 
              orders={orders} 
              sectors={sectors} 
              subSectors={subSectors} 
              onUpdateStatus={updateOrderStatus} 
              onDelete={deleteOrder} 
              onNotify={sendWhatsAppNotification}
              onReplicate={handleReplicate}
              searchQuery={searchQuery}
              activeUser={activeUser}
              users={users}
            />
          )}
          {activeTab === 'new-order' && <OrderFormView initialData={replicateOrderData} sectors={sectors} subSectors={subSectors} onSubmit={addOrder} onCancel={() => { setReplicateOrderData(null); setActiveTab('dashboard'); }} />}
          {activeTab === 'piece-order' && <PieceOrderFormView initialData={replicateOrderData} sectors={sectors} subSectors={subSectors} onSubmit={addOrder} onCancel={() => { setReplicateOrderData(null); setActiveTab('dashboard'); }} />}
          {activeTab === 'weight-calc' && <WeightCalculatorView sheets={sheets} tubesRound={tubesRound} tubesSquare={tubesSquare} tubesRect={tubesRect} activeUser={activeUser} />}
          {activeTab === 'eng-registry' && (
            <EngineeringRegistryView 
              sheets={sheets} 
              tubesRound={tubesRound} 
              tubesSquare={tubesSquare} 
              tubesRect={tubesRect} 
              loadHistory={loadHistory}
              setLoadHistory={setLoadHistory}
              library={library}
              setLibrary={setLibrary}
              activeUser={activeUser}
            />
          )}
          {activeTab === 'history' && <HistoryView loadHistory={loadHistory} setLoadHistory={setLoadHistory} activeUser={activeUser} users={users} />}
          {activeTab === 'settings' && (
            isSettingsUnlocked ? (
              <SettingsView 
                config={config} setConfig={setConfig} users={users} setUsers={setUsers} 
                sectors={sectors} setSectors={setSectors} subSectors={subSectors} setSubSectors={setSubSectors} 
                sheets={sheets} setSheets={setSheets} tubesRound={tubesRound} setTubesRound={setTubesRound} 
                tubesSquare={tubesSquare} setTubesSquare={setTubesSquare} tubesRect={tubesRect} setTubesRect={setTubesRect} 
              />
            ) : (
              <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[3rem] shadow-2xl border-2 border-slate-100 animate-in zoom-in-95 duration-500 flex flex-col items-center">
                 <div className="w-16 h-16 bg-[#002855] rounded-2xl flex items-center justify-center mb-6 shadow-lg border-2 border-[#FFB800]">
                    <KeyRound className="w-8 h-8 text-[#FFB800]" />
                 </div>
                 <h2 className="text-xl font-black text-[#002855] uppercase italic mb-2">Painel de Administração</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Digite a senha de segurança para acessar o módulo de configurações.</p>
                 <form onSubmit={handleSettingsUnlock} className="w-full space-y-4">
                    <input 
                       type="password" 
                       value={settingsUnlockInput}
                       onChange={e => setSettingsUnlockInput(e.target.value)}
                       placeholder="SENHA DE ACESSO"
                       className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] outline-none focus:border-[#FFB800] text-center"
                    />
                    <button type="submit" className="w-full py-5 bg-[#002855] text-[#FFB800] font-black uppercase text-[10px] rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-[#001a35] transition-all">
                       <ShieldCheck className="w-5 h-5" /> Liberar Painel
                    </button>
                 </form>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps { icon: React.ReactNode; label: string; active: boolean; collapsed: boolean; onClick: () => void; }
const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 ${active ? 'bg-[#FFB800] text-[#001a35] font-black shadow-lg shadow-[#FFB800]/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}>
    <span className={`w-6 h-6 flex-shrink-0 ${active ? 'text-[#001a35]' : ''}`}>{icon}</span>
    {!collapsed && <span className="font-bold tracking-tight">{label}</span>}
  </button>
);

export default App;
