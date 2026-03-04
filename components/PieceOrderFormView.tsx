
import React, { useState, useEffect } from 'react';
import { ProductionOrder, PieceItem, OrderStatus, Priority, ProductionSector, ProductionSubSector } from '../types';
import { Save, X, User, Package, Layers, Plus, Trash2, Table as TableIcon, MessageSquare, Factory, FileText, LayoutGrid } from 'lucide-react';
import DatePicker from './DatePicker';

interface Props {
  onSubmit: (order: ProductionOrder, notify: boolean) => void;
  onCancel: () => void;
  sectors: ProductionSector[];
  subSectors: ProductionSubSector[];
  initialData?: ProductionOrder | null;
}

const PieceOrderFormView: React.FC<Props> = ({ onSubmit, onCancel, sectors, subSectors, initialData }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    productName: '',
    deadline: '',
    priority: Priority.MEDIUM,
    sector: '',
    subSector: '',
    notes: ''
  });

  const [items, setItems] = useState<PieceItem[]>([
    { id: '1', partCode: '01', description: 'PEÇA', quantity: 1, medidaL: '', medidaA: '', material: '' }
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName,
        productName: initialData.productName,
        deadline: '', // Limpa prazo para replicação
        priority: initialData.priority,
        sector: initialData.sector,
        subSector: initialData.subSector || '',
        notes: initialData.notes || ''
      });

      if (initialData.items && initialData.items.length > 0) {
        setItems(initialData.items.map(item => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9) // Novos IDs para as peças replicadas
        })));
      }
    }
  }, [initialData]);

  const addRow = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).substr(2, 9), partCode: (items.length + 1).toString().padStart(2, '0'), description: 'PEÇA', quantity: 1, medidaL: '', medidaA: '', material: '' }
    ]);
  };

  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof PieceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAction = (notify: boolean) => {
    if (!formData.clientName || !formData.productName || !formData.deadline || !formData.sector) {
      alert("Erro: Preencha Cliente, Produto Master, Setor e Prazo.");
      return;
    }

    const newOrder: ProductionOrder = {
      ...formData,
      id: `SA-DT-${Math.floor(Math.random() * 9000) + 1000}`,
      quantity: items.reduce((acc, curr) => acc + curr.quantity, 0),
      unit: 'peças',
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      items: items,
      history: []
    };
    onSubmit(newOrder, notify);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#002855] p-10 text-white relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <TableIcon className="w-40 h-40" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-2 bg-[#FFB800] rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB800]">Engenharia e Projetos</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            {initialData ? 'Replicar Ordem Detalhada' : 'Nova Ordem Detalhada'}
          </h2>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-3 h-3 text-[#FFB800]" /> Cliente
              </label>
              <input 
                type="text" 
                value={formData.clientName}
                onChange={e => setFormData({...formData, clientName: e.target.value})}
                placeholder="Cliente"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-2">
                <Factory className="w-3 h-3 text-[#FFB800]" /> Setor
              </label>
              <select 
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855] cursor-pointer"
              >
                <option value="">Selecione...</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-2">
                <LayoutGrid className="w-3 h-3 text-[#FFB800]" /> Sub-setor
              </label>
              <select 
                value={formData.subSector}
                onChange={e => setFormData({...formData, subSector: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855] cursor-pointer"
              >
                <option value="">Selecione...</option>
                {subSectors.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-2">
                <Package className="w-3 h-3 text-[#FFB800]" /> Produto Master
              </label>
              <input 
                type="text" 
                value={formData.productName}
                onChange={e => setFormData({...formData, productName: e.target.value})}
                placeholder="Ex: PORTÃO BASCULANTE"
                className="w-full px-5 py-4 rounded-2xl bg-[#FFB800]/5 border-2 border-[#FFB800]/20 focus:border-[#FFB800] outline-none font-black text-[#002855] uppercase"
              />
            </div>
            
            <DatePicker 
              label="Prazo Final"
              value={formData.deadline}
              onChange={date => setFormData({...formData, deadline: date})}
              placeholder="Data..."
              className="mt-0"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
              <h3 className="text-sm font-black text-[#002855] uppercase tracking-[0.2em] flex items-center gap-3">
                <TableIcon className="w-5 h-5 text-[#FFB800]" /> Composição da Ordem
              </h3>
              <button 
                onClick={addRow} 
                className="bg-[#002855] text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#001a35] transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4 text-[#FFB800]" /> Adicionar Linha
              </button>
            </div>

            <div className="border-4 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFB800] text-[#002855] text-[12px] font-black uppercase tracking-[0.3em] text-center">
                    <th colSpan={7} className="px-6 py-4 border-b-2 border-[#002855]/10">Detalhamento Técnico das Peças</th>
                  </tr>
                  <tr className="bg-black text-white text-[10px] font-black uppercase tracking-widest">
                    <th className="px-4 py-5 text-center w-20">Cód.</th>
                    <th className="px-6 py-5">Peça / Descrição</th>
                    <th className="px-4 py-5 text-center w-24">L (MM)</th>
                    <th className="px-4 py-5 text-center w-24">A (MM)</th>
                    <th className="px-4 py-5 text-center w-20">Qtd</th>
                    <th className="px-6 py-5">Matéria Prima</th>
                    <th className="px-4 py-5 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-3">
                        <input 
                          type="text" 
                          value={item.partCode} 
                          onChange={e => updateItem(item.id, 'partCode', e.target.value.toUpperCase())} 
                          className="w-full bg-slate-50 px-2 py-2 rounded-lg border-none font-black text-[#002855] text-xs text-center uppercase" 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={item.description} 
                          onChange={e => updateItem(item.id, 'description', e.target.value.toUpperCase())} 
                          className="w-full bg-transparent border-none font-black text-[#002855] text-xs uppercase" 
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="text" 
                          value={item.medidaL} 
                          onChange={e => updateItem(item.id, 'medidaL', e.target.value)} 
                          className="w-full bg-transparent border-none font-black text-center text-[#c2410c] text-sm" 
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="text" 
                          value={item.medidaA} 
                          onChange={e => updateItem(item.id, 'medidaA', e.target.value)} 
                          className="w-full bg-transparent border-none font-black text-center text-[#c2410c] text-sm" 
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} 
                          className="w-full bg-transparent border-none font-black text-[#002855] text-center text-sm" 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={item.material} 
                          onChange={e => updateItem(item.id, 'material', e.target.value.toUpperCase())} 
                          placeholder="EX: AÇO 1020"
                          className="w-full bg-slate-50/50 px-3 py-2 rounded-lg border-none font-black text-[#002855] text-xs uppercase placeholder:text-slate-300" 
                        />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => removeRow(item.id)} className="p-3 text-slate-300 hover:text-red-600 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-[#002855] uppercase tracking-widest flex items-center gap-2 ml-1">
              <FileText className="w-4 h-4 text-[#FFB800]" /> Observações Técnicas
            </label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-[#002855] min-h-[100px] resize-none"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 pt-10">
            <button 
              onClick={() => handleAction(false)} 
              className="flex-1 bg-white border-2 border-[#002855] text-[#002855] font-black uppercase py-5 rounded-2xl hover:bg-[#002855] hover:text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <Save className="w-6 h-6" /> {initialData ? 'REPLICAR AGORA' : 'FINALIZAR REGISTRO'}
            </button>
            <button 
              onClick={() => handleAction(true)} 
              className="flex-1 bg-[#25D366] text-white font-black uppercase py-5 rounded-2xl shadow-xl hover:bg-[#128C7E] transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-6 h-6" /> {initialData ? 'REPLICAR + WHATSAPP' : 'REGISTRO + WHATSAPP'}
            </button>
          </div>
          
          <button 
            onClick={onCancel} 
            className="w-full py-4 text-slate-400 hover:text-red-500 font-black uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> ABORTAR OPERAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
};

export default PieceOrderFormView;
