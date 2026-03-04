
import React, { useState, useEffect } from 'react';
import { ProductionOrder, OrderStatus, Priority, ProductionSector, ProductionSubSector } from '../types';
import { Save, X, User, Package, Layers, AlertCircle, MessageSquare, Factory, FileText, LayoutGrid } from 'lucide-react';
import DatePicker from './DatePicker';

interface Props {
  onSubmit: (order: ProductionOrder, notify: boolean) => void;
  onCancel: () => void;
  sectors: ProductionSector[];
  subSectors: ProductionSubSector[];
  initialData?: ProductionOrder | null;
}

const OrderFormView: React.FC<Props> = ({ onSubmit, onCancel, sectors, subSectors, initialData }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    productName: '',
    quantity: 1,
    unit: 'unidades',
    deadline: '',
    priority: Priority.MEDIUM,
    sector: '',
    subSector: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName,
        productName: initialData.productName,
        quantity: initialData.quantity,
        unit: initialData.unit,
        deadline: '', // Limpa o prazo para replicação forçar nova data
        priority: initialData.priority,
        sector: initialData.sector,
        subSector: initialData.subSector || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleAction = (notify: boolean) => {
    if (!formData.clientName || !formData.productName || !formData.deadline || !formData.sector) {
      alert("ERRO: Preencha Cliente, Produto, Setor e Prazo.");
      return;
    }

    const newOrder: ProductionOrder = {
      ...formData,
      id: `SA-${Math.floor(Math.random() * 900000) + 100000}`,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      history: []
    };
    onSubmit(newOrder, notify);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#002855] p-10 text-white relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Layers className="w-40 h-40" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-2 bg-[#FFB800] rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFB800]">Departamento de Produção</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            {initialData ? 'Replicar Ordem de Produção' : 'Registrar Nova OP'}
          </h2>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-[#002855] uppercase tracking-widest flex items-center gap-2 ml-1">
                <User className="w-4 h-4 text-[#FFB800]" /> Nome do Cliente
              </label>
              <input 
                required
                type="text" 
                value={formData.clientName}
                onChange={e => setFormData({...formData, clientName: e.target.value})}
                placeholder="Ex: METALURGICA NORTE"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none transition-all font-bold text-[#002855]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-[#002855] uppercase tracking-widest flex items-center gap-2 ml-1">
                <Package className="w-4 h-4 text-[#FFB800]" /> Produto Final
              </label>
              <input 
                required
                type="text" 
                value={formData.productName}
                onChange={e => setFormData({...formData, productName: e.target.value})}
                placeholder="Ex: PERFILADO DE AÇO 3/8"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none transition-all font-bold text-[#002855]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-[#002855] uppercase tracking-widest flex items-center gap-2 ml-1">
                <Factory className="w-4 h-4 text-[#FFB800]" /> Setor Responsável
              </label>
              <select 
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855] cursor-pointer"
              >
                <option value="">Selecione o Setor...</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-[#002855] uppercase tracking-widest flex items-center gap-2 ml-1">
                <LayoutGrid className="w-4 h-4 text-[#FFB800]" /> Sub-setor Responsável
              </label>
              <select 
                value={formData.subSector}
                onChange={e => setFormData({...formData, subSector: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855] cursor-pointer"
              >
                <option value="">Selecione o Sub-setor...</option>
                {subSectors.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-[#002855] uppercase tracking-widest flex items-center gap-2 ml-1">
                <Layers className="w-4 h-4 text-[#FFB800]" /> Demanda
              </label>
              <div className="flex gap-3">
                <input 
                  type="number" 
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-black text-[#002855]"
                />
                <select 
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                  className="w-24 px-4 py-4 rounded-2xl bg-[#002855] text-white font-black text-xs cursor-pointer outline-none"
                >
                  <option value="un">UN</option>
                  <option value="kg">KG</option>
                  <option value="ton">TON</option>
                </select>
              </div>
            </div>

            <DatePicker 
              label="Prazo de Entrega"
              value={formData.deadline}
              onChange={date => setFormData({...formData, deadline: date})}
              placeholder="Selecionar data..."
            />

            <div className="space-y-3">
              <label className="text-xs font-black text-[#002855] uppercase tracking-widest flex items-center gap-2 ml-1">
                <AlertCircle className="w-4 h-4 text-[#FFB800]" /> Prioridade
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(Priority).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, priority: p})}
                    className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all shadow-sm ${
                      formData.priority === p 
                      ? 'bg-[#002855] border-[#002855] text-white' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-[#FFB800]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-black text-[#002855] uppercase tracking-widest flex items-center gap-2 ml-1">
                <FileText className="w-4 h-4 text-[#FFB800]" /> Observações Gerais / Notas Técnicas
              </label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Insira aqui informações adicionais..."
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none transition-all font-bold text-[#002855] min-h-[150px] resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-5 pt-6">
            <button 
              type="button"
              onClick={() => handleAction(false)}
              className="flex-1 bg-white border-2 border-[#002855] text-[#002855] hover:bg-slate-50 font-black uppercase tracking-widest py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-slate-100"
            >
              <Save className="w-6 h-6" /> {initialData ? 'REPLICAR AGORA' : 'REGISTRAR'}
            </button>
            <button 
              type="button"
              onClick={() => handleAction(true)}
              className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase tracking-widest py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95"
            >
              <MessageSquare className="w-6 h-6" /> {initialData ? 'REPLICAR + WHATSAPP' : 'REGISTRAR + WHATSAPP'}
            </button>
          </div>
          
          <button 
            type="button"
            onClick={onCancel}
            className="w-full py-4 text-slate-400 hover:text-red-500 font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> CANCELAR OPERAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFormView;
