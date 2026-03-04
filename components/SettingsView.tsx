
import React, { useState } from 'react';
import { SystemUser, SystemConfig, WhatsappContact, ProductionSector, ProductionSubSector, SheetMaterial, TubeRoundMaterial, MetalonSquareMaterial, MetalonRectMaterial } from '../types';
import { Users, MessageSquare, Plus, Trash2, ShieldCheck, Phone, Factory, LayoutGrid, Layers, X, Circle, Square, Maximize, BellRing, Smartphone, UserPlus, UserCheck, Briefcase, Lock, Eye, EyeOff, ShieldAlert, Save, KeyRound } from 'lucide-react';

interface Props {
  config: SystemConfig;
  setConfig: (config: SystemConfig) => void;
  users: SystemUser[];
  setUsers: (users: SystemUser[]) => void;
  sectors: ProductionSector[];
  setSectors: (sectors: ProductionSector[]) => void;
  subSectors: ProductionSubSector[];
  setSubSectors: (subSectors: ProductionSubSector[]) => void;
  sheets: SheetMaterial[];
  setSheets: (sheets: SheetMaterial[]) => void;
  tubesRound: TubeRoundMaterial[];
  setTubesRound: (m: TubeRoundMaterial[]) => void;
  tubesSquare: MetalonSquareMaterial[];
  setTubesSquare: (m: MetalonSquareMaterial[]) => void;
  tubesRect: MetalonRectMaterial[];
  setTubesRect: (m: MetalonRectMaterial[]) => void;
}

const SettingsView: React.FC<Props> = ({ 
  config, setConfig, users, setUsers, sectors, setSectors, subSectors, setSubSectors, 
  sheets, setSheets, tubesRound, setTubesRound, tubesSquare, setTubesSquare, tubesRect, setTubesRect 
}) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Operador');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [newSettingsPass, setNewSettingsPass] = useState(config.settingsPassword || '');

  const [newSectorName, setNewSectorName] = useState('');
  const [newSubSectorName, setNewSubSectorName] = useState('');
  const [newContactLabel, setNewContactLabel] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetThickness, setNewSheetThickness] = useState('');
  const [newTubeRName, setNewTubeRName] = useState('');
  const [newTubeRDiam, setNewTubeRDiam] = useState('');
  const [newTubeSName, setNewTubeSName] = useState('');
  const [newTubeSSide, setNewTubeSSide] = useState('');
  const [newTubeRectName, setNewTubeRectName] = useState('');
  const [newTubeRectW, setNewTubeRectW] = useState('');
  const [newTubeRectH, setNewTubeRectH] = useState('');

  const updateSettingsPassword = () => {
    setConfig({ ...config, settingsPassword: newSettingsPass });
    alert("Senha de acesso às configurações atualizada com sucesso!");
  };

  const addUser = () => {
    if (!newUserName.trim() || !newUserPassword.trim()) {
      alert("Nome e Senha são obrigatórios.");
      return;
    }
    const newUser: SystemUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUserName.toUpperCase(),
      role: newUserRole,
      password: newUserPassword
    };
    setUsers([...users, newUser]);
    setNewUserName('');
    setNewUserPassword('');
    setNewUserRole('Operador');
  };

  const removeUser = (id: string) => {
    if (users.length <= 1) {
      alert("O sistema precisa de pelo menos um usuário cadastrado.");
      return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  const addSector = () => {
    if (!newSectorName) return;
    setSectors([...sectors, { id: Math.random().toString(36).substr(2, 9), name: newSectorName.toUpperCase() }]);
    setNewSectorName('');
  };

  const addSubSector = () => {
    if (!newSubSectorName) return;
    setSubSectors([...subSectors, { id: Math.random().toString(36).substr(2, 9), name: newSubSectorName.toUpperCase() }]);
    setNewSubSectorName('');
  };

  const removeSector = (id: string) => setSectors(sectors.filter(s => s.id !== id));
  const removeSubSector = (id: string) => setSubSectors(subSectors.filter(s => s.id !== id));

  const addContact = () => {
    if (!newContactLabel || !newContactNumber) {
      alert("Preencha a identificação e o número do WhatsApp.");
      return;
    }
    const cleanNumber = newContactNumber.replace(/\D/g, '');
    const newContact: WhatsappContact = {
      id: Math.random().toString(36).substr(2, 9),
      label: newContactLabel.toUpperCase(),
      number: cleanNumber
    };
    setConfig({ ...config, contacts: [...config.contacts, newContact] });
    setNewContactLabel('');
    setNewContactNumber('');
  };

  const removeContact = (id: string) => {
    if (config.contacts.length <= 1) {
      alert("Mantenha pelo menos um contato para notificações.");
      return;
    }
    setConfig({ ...config, contacts: config.contacts.filter(c => c.id !== id) });
  };

  const addSheet = () => {
    if (!newSheetName || !newSheetThickness) return;
    setSheets([...sheets, { id: Math.random().toString(36).substr(2, 9), name: newSheetName.toUpperCase(), thickness: newSheetThickness }]);
    setNewSheetName(''); setNewSheetThickness('');
  };

  const addTubeRound = () => {
    if (!newTubeRName || !newTubeRDiam) return;
    setTubesRound([...tubesRound, { id: Math.random().toString(36).substr(2, 9), name: newTubeRName.toUpperCase(), diameter: newTubeRDiam, wall: '0' }]);
    setNewTubeRName(''); setNewTubeRDiam('');
  };

  const addTubeSquare = () => {
    if (!newTubeSName || !newTubeSSide) return;
    setTubesSquare([...tubesSquare, { id: Math.random().toString(36).substr(2, 9), name: newTubeSName.toUpperCase(), side: newTubeSSide, wall: '0' }]);
    setNewTubeSName(''); setNewTubeSSide('');
  };

  const addTubeRect = () => {
    if (!newTubeRectName || !newTubeRectW || !newTubeRectH) return;
    setTubesRect([...tubesRect, { id: Math.random().toString(36).substr(2, 9), name: newTubeRectName.toUpperCase(), width: newTubeRectW, height: newTubeRectH, wall: '0' }]);
    setNewTubeRectName(''); setNewTubeRectW(''); setNewTubeRectH('');
  };

  const roles = [
    'Administrador',
    'Analista de PCP',
    'Encarregado',
    'Engenheiro',
    'Estagiário',
    'Inspetor Qualidade',
    'Jovem Aprendiz',
    'Operador',
    'Vendas'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-2 bg-[#FFB800] rounded-full"></div>
            <h2 className="text-3xl font-black text-[#002855] uppercase tracking-tighter italic">Configurações do Sistema</h2>
          </div>
          <p className="text-slate-500 font-medium">Gestão de catálogos e estruturas operacionais SÓ AÇO.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Nova seção: Segurança do Painel */}
        <div className="bg-white rounded-[2rem] border-2 border-[#002855]/10 shadow-md overflow-hidden flex flex-col">
          <div className="bg-[#002855] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="w-6 h-6 text-[#FFB800]" />
              <span className="font-black uppercase tracking-widest text-xs italic">Segurança do Painel</span>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
                Esta senha bloqueia o acesso à aba de configurações. A senha mestra <span className="text-amber-900 font-black">104210</span> sempre funcionará como backup.
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Nova Senha de Acesso ao Painel</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="EX: 123456" 
                  value={newSettingsPass} 
                  onChange={e => setNewSettingsPass(e.target.value)} 
                  className="input-sa flex-1" 
                />
                <button onClick={updateSettingsPassword} className="bg-[#002855] text-[#FFB800] px-6 rounded-xl hover:bg-[#001a35] transition-all flex items-center gap-2 active:scale-95">
                  <Save className="w-4 h-4" /> <span className="text-[9px] font-black uppercase">Salvar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gestão de Usuários com Senha */}
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-md overflow-hidden flex flex-col">
          <div className="bg-[#002855] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#FFB800]" />
              <span className="font-black uppercase tracking-widest text-xs italic">Gestão de Usuários e Equipe</span>
            </div>
            <span className="text-[10px] font-black bg-white/10 text-white px-2 py-1 rounded">CONTROLE DE ACESSO</span>
          </div>
          <div className="p-8 space-y-6 flex-1 flex flex-col">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                  <input type="text" placeholder="EX: JOÃO DA SILVA" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="input-sa" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Cargo / Função</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="input-sa cursor-pointer">
                    {roles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha de Acesso</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="DIGITE A SENHA" 
                    value={newUserPassword} 
                    onChange={e => setNewUserPassword(e.target.value)} 
                    className="input-sa pr-12" 
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002855]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button onClick={addUser} className="w-full bg-[#002855] text-[#FFB800] py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-[#001a35] transition-all shadow-lg active:scale-95 border-b-4 border-[#FFB800]">
                <UserPlus className="w-4 h-4" /> Cadastrar Novo Membro
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-[#FFB800]/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#002855] rounded-xl flex items-center justify-center text-[#FFB800]">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[#002855] uppercase">{user.name}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-2.5 h-2.5 text-slate-400" />
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-2.5 h-2.5 text-emerald-500" />
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Protegido</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onDoubleClick={() => removeUser(user.id)} 
                    className="p-3 text-slate-300 hover:text-white hover:bg-rose-500 transition-all bg-white rounded-lg shadow-sm border border-slate-100 active:animate-bounce"
                    title="CLIQUE DUPLO PARA REMOVER"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notificações WhatsApp */}
        <div className="bg-white rounded-[2rem] border-2 border-emerald-100 shadow-md overflow-hidden flex flex-col">
          <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-white" />
              <span className="font-black uppercase tracking-widest text-xs italic">Notificações WhatsApp</span>
            </div>
            <span className="text-[10px] font-black bg-white/20 text-white px-2 py-1 rounded">DISPARO AUTOMÁTICO</span>
          </div>
          <div className="p-8 space-y-6 flex-1 flex flex-col">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="CONTATO" value={newContactLabel} onChange={e => setNewContactLabel(e.target.value)} className="input-sa border-emerald-50 focus:border-emerald-500" />
                <input type="text" placeholder="NÚMERO" value={newContactNumber} onChange={e => setNewContactNumber(e.target.value)} className="input-sa border-emerald-50 focus:border-emerald-500" />
              </div>
              <button onClick={addContact} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
                <Plus className="w-4 h-4" /> Adicionar Contato
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {config.contacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 group transition-all hover:border-emerald-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[#002855] uppercase">{contact.label}</p>
                      <p className="text-[10px] font-bold text-emerald-600">{contact.number}</p>
                    </div>
                  </div>
                  <button 
                    onDoubleClick={() => removeContact(contact.id)} 
                    className="p-3 text-slate-300 hover:text-white hover:bg-rose-500 transition-all bg-white rounded-lg shadow-sm border border-slate-100 active:animate-bounce"
                    title="CLIQUE DUPLO PARA REMOVER"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Catálogo de Chapas */}
        <CatalogCard 
          title="Catálogo de Chapas" 
          icon={<Layers className="w-6 h-6 text-[#FFB800]" />} 
          count={sheets.length}
          inputs={
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Nome" value={newSheetName} onChange={e => setNewSheetName(e.target.value)} className="input-sa" />
              <input type="text" placeholder="Espessura (mm)" value={newSheetThickness} onChange={e => setNewSheetThickness(e.target.value)} className="input-sa" />
            </div>
          }
          onAdd={addSheet}
          items={sheets.map(s => ({ id: s.id, label: s.name, sub: `E: ${s.thickness} mm` }))}
          onRemove={(id: string) => setSheets(sheets.filter(x => x.id !== id))}
        />

        {/* Catálogo Tubo Redondo */}
        <CatalogCard 
          title="Tubo Redondo" 
          icon={<Circle className="w-6 h-6 text-[#FFB800]" />} 
          count={tubesRound.length}
          inputs={
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Ex: Tubo 2 Pol" value={newTubeRName} onChange={e => setNewTubeRName(e.target.value)} className="input-sa" />
              <input type="text" placeholder="Ø (mm)" value={newTubeRDiam} onChange={e => setNewTubeRDiam(e.target.value)} className="input-sa" />
            </div>
          }
          onAdd={addTubeRound}
          items={tubesRound.map(s => ({ id: s.id, label: s.name, sub: `Ø: ${s.diameter} mm` }))}
          onRemove={(id: string) => setTubesRound(tubesRound.filter(x => x.id !== id))}
        />

        {/* Catálogo Metalon Quadrado */}
        <CatalogCard 
          title="Metalon Quad." 
          icon={<Square className="w-6 h-6 text-[#FFB800]" />} 
          count={tubesSquare.length}
          inputs={
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Ex: 50x50" value={newTubeSName} onChange={e => setNewTubeSName(e.target.value)} className="input-sa" />
              <input type="text" placeholder="Lado (mm)" value={newTubeSSide} onChange={e => setNewTubeSSide(e.target.value)} className="input-sa" />
            </div>
          }
          onAdd={addTubeSquare}
          items={tubesSquare.map(s => ({ id: s.id, label: s.name, sub: `Dim: ${s.side}x${s.side}` }))}
          onRemove={(id: string) => setTubesSquare(tubesSquare.filter(x => x.id !== id))}
        />

        {/* Catálogo Metalon Retangular */}
        <CatalogCard 
          title="Metalon Rect." 
          icon={<Maximize className="w-6 h-6 text-[#FFB800]" />} 
          count={tubesRect.length}
          inputs={
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Nome" value={newTubeRectName} onChange={e => setNewTubeRectName(e.target.value)} className="input-sa" />
              <input type="text" placeholder="W" value={newTubeRectW} onChange={e => setNewTubeRectW(e.target.value)} className="input-sa" />
              <input type="text" placeholder="H" value={newTubeRectH} onChange={e => setNewTubeRectH(e.target.value)} className="input-sa" />
            </div>
          }
          onAdd={addTubeRect}
          items={tubesRect.map(s => ({ id: s.id, label: s.name, sub: `${s.width}x${s.height}` }))}
          onRemove={(id: string) => setTubesRect(tubesRect.filter(x => x.id !== id))}
        />

        {/* Gestão de Setores e Sub-Setores */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Factory className="w-6 h-6 text-[#002855]" />
                <span className="font-black uppercase tracking-widest text-xs text-[#002855]">Macro-Setores</span>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex gap-2">
                <input type="text" placeholder="Novo Setor" value={newSectorName} onChange={e => setNewSectorName(e.target.value)} className="input-sa flex-1" />
                <button onClick={addSector} className="bg-[#002855] text-[#FFB800] p-3 rounded-xl hover:bg-[#001a35]"><Plus /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sectors.map(s => (
                  <span key={s.id} onDoubleClick={() => removeSector(s.id)} className="bg-slate-100 text-[#002855] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 border border-slate-200 cursor-help hover:bg-rose-500 hover:text-white transition-all active:animate-bounce" title="DUPLO CLIQUE PARA REMOVER">
                    {s.name} <Trash2 className="w-3 h-3 opacity-30" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-6 h-6 text-[#FFB800]" />
                <span className="font-black uppercase tracking-widest text-xs text-[#002855]">Sub-Setores</span>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex gap-2">
                <input type="text" placeholder="Novo Sub-Setor" value={newSubSectorName} onChange={e => setNewSubSectorName(e.target.value)} className="input-sa flex-1" />
                <button onClick={addSubSector} className="bg-[#002855] text-[#FFB800] p-3 rounded-xl hover:bg-[#001a35]"><Plus /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {subSectors.map(s => (
                  <span key={s.id} onDoubleClick={() => removeSubSector(s.id)} className="bg-amber-50 text-[#002855] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 border border-[#FFB800]/30 cursor-help hover:bg-rose-500 hover:text-white transition-all active:animate-bounce" title="DUPLO CLIQUE PARA REMOVER">
                    {s.name} <Trash2 className="w-3 h-3 opacity-30" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .input-sa { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; background-color: #f8fafc; border: 2px solid #f1f5f9; outline: none; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .input-sa:focus { border-color: #FFB800; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #002855; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const CatalogCard = ({ title, icon, count, inputs, onAdd, items, onRemove }: any) => (
  <div className="bg-white rounded-[2rem] border-2 border-[#FFB800]/10 shadow-md overflow-hidden flex flex-col">
    <div className="bg-[#002855] p-6 text-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-black uppercase tracking-widest text-xs italic">{title}</span>
      </div>
      <span className="text-[10px] font-black bg-[#FFB800] text-[#002855] px-2 py-1 rounded">{count} ITENS</span>
    </div>
    <div className="p-8 space-y-4 flex-1 flex flex-col">
      {inputs}
      <button onClick={onAdd} className="w-full bg-[#002855] text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 border-b-4 border-[#FFB800] hover:bg-[#001a35]">
        <Plus className="w-4 h-4 text-[#FFB800]" /> Salvar Perfil
      </button>
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all">
            <div>
              <p className="text-xs font-black text-[#002855] uppercase">{item.label}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">{item.sub}</p>
            </div>
            <button 
              onDoubleClick={() => onRemove(item.id)} 
              className="p-3 text-slate-300 hover:text-white hover:bg-rose-500 rounded-lg shadow-sm border border-slate-100 transition-all active:animate-bounce"
              title="DUPLO CLIQUE PARA REMOVER"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SettingsView;
