
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
import { ProductionOrder, OrderStatus, Priority, SystemUser, SystemConfig, WhatsappContact, ProductionSector, ProductionSubSector, AuditEntry, SheetMaterial, TubeRoundMaterial, MetalonSquareMaterial, MetalonRectMaterial, LoadHistoryEntry, EngineeringPart } from './types';
import DashboardView from './components/DashboardView';
import OrderFormView from './components/OrderFormView';
import OrderListView from './components/OrderListView';
import PieceOrderFormView from './components/PieceOrderFormView';
import SettingsView from './components/SettingsView';
import WeightCalculatorView from './components/WeightCalculatorView';
import EngineeringRegistryView from './components/EngineeringRegistryView';
import HistoryView from './components/HistoryView';
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

  // TELA DE SETUP INICIAL
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
              <input required type="password" value={setupPass} onChange={e => setSetupPass(e.target.value)} placeholder="DIGITE SUA SENHA" className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] outline-none focus:border-[#FFB800]" />
            </div>
            <button type="submit" className="w-full py-6 bg-[#002855] text-[#FFB800] font-black uppercase text-xs rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-[#001328] transition-all active:scale-95 border-b-4 border-[#FFB800]">
              <ShieldAlert className="w-5 h-5" /> Ativar Sistema SÓ AÇO
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TELA DE LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#001a35] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="grid grid-cols-12 h-full w-full">
              {Array.from({length: 144}).map((_, i) => <div key={i} className="border border-white/5"></div>)}
           </div>
        </div>
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 relative z-10 animate-in slide-in-from-bottom-8 duration-700">
           <div className="flex flex-col items-center mb-10">
              <SoAcoLogo large />
              <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                 <Lock className="w-3.5 h-3.5 text-[#002855]" />
                 <span className="text-[9px] font-black text-[#002855] uppercase tracking-widest">Acesso Restrito Industrial</span>
              </div>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Selecionar Usuário</label>
                 <select 
                    required 
                    value={loginUserId} 
                    onChange={e => setLoginUserId(e.target.value)}
                    className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] outline-none focus:border-[#FFB800] appearance-none cursor-pointer uppercase"
                 >
                    <option value="">-- SELECIONE SEU NOME --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha Individual</label>
                 <div className="relative">
                    <input 
                      required 
                      type={showLoginPass ? "text" : "password"} 
                      value={loginPassword} 
                      onChange={e => setLoginPassword(e.target.value)} 
                      placeholder="SUA SENHA" 
                      className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] outline-none focus:border-[#FFB800]" 
                    />
                    <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#002855]">
                      {showLoginPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                 </div>
              </div>

              {loginError && <p className="text-red-600 text-[10px] font-black uppercase text-center">{loginError}</p>}

              <button type="submit" className="w-full py-6 bg-[#002855] text-[#FFB800] font-black uppercase text-xs rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-[#001328] transition-all active:scale-95 border-b-4 border-[#FFB800]">
                 <LogIn className="w-5 h-5" /> Entrar no Sistema
              </button>
           </form>
           <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-10">Software de Gestão Proprietário SÓ AÇO © 2025</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      <aside className={`bg-[#001a35] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shadow-2xl z-20`}>
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className={`${!isSidebarOpen && 'hidden'}`}>
            <SoAcoLogo light />
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded transition-colors">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6 mx-auto" />}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} collapsed={!isSidebarOpen} onClick={() => { setReplicateOrderData(null); setActiveTab('dashboard'); }} />
          <NavItem icon={<ListTodo />} label="Ordens de Serviço" active={activeTab === 'orders'} collapsed={!isSidebarOpen} onClick={() => { setReplicateOrderData(null); setActiveTab('orders'); }} />
          <div className="py-2"><div className={`h-px bg-white/10 mb-2 ${!isSidebarOpen && 'mx-4'}`}></div></div>
          <NavItem icon={<PlusCircle />} label="Nova OP Simples" active={activeTab === 'new-order'} collapsed={!isSidebarOpen} onClick={() => { setReplicateOrderData(null); setActiveTab('new-order'); }} />
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
          <div className="flex items-center gap-4 flex-1 max-xl">
            <div className="relative w-full">
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
