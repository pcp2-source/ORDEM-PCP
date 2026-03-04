
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LoadHistoryEntry, EngineeringPart, SystemUser } from '../types';
import { 
  History, 
  Trash2, 
  Printer, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  Calendar, 
  Clock, 
  Box, 
  Layers,
  ArrowRight,
  ClipboardList,
  Eye,
  XCircle,
  FileText,
  ShieldCheck,
  UserCircle,
  User,
  Check,
  Eraser
} from 'lucide-react';
import DatePicker from './DatePicker';

interface Props {
  loadHistory: LoadHistoryEntry[];
  setLoadHistory: React.Dispatch<React.SetStateAction<LoadHistoryEntry[]>>;
  activeUser: SystemUser | null;
  users: SystemUser[];
}

const HistoryView: React.FC<Props> = ({ loadHistory, setLoadHistory, activeUser, users }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelection = (user: string) => {
    setSelectedCreators(prev => 
      prev.includes(user) ? prev.filter(u => u !== user) : [...prev, user]
    );
  };

  const handleDoubleClickDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadHistory(prev => prev.filter(h => h.id !== id));
    if (expandedRow === id) setExpandedRow(null);
  };

  // Lista oficial de usuários cadastrados
  const availableUsers = useMemo(() => {
    return users.map(u => u.name).sort();
  }, [users]);

  const filteredHistory = useMemo(() => {
    return loadHistory.filter(h => {
      const date = new Date(h.timestamp);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      let dateMatch = true;
      if (start && end) {
        end.setHours(23, 59, 59);
        dateMatch = date >= start && date <= end;
      } else if (start) {
        dateMatch = date >= start;
      } else if (end) {
        end.setHours(23, 59, 59);
        dateMatch = date <= end;
      }
      
      if (!dateMatch) return false;

      const creatorMatch = selectedCreators.length > 0 ? (h.createdBy && selectedCreators.includes(h.createdBy)) : true;
      if (!creatorMatch) return false;

      const products = h.fullLibrary ? h.fullLibrary.map(p => p.masterProduct).join(' ') : '';
      return (
        h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.totalWeight.toString().includes(searchTerm) ||
        products.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [loadHistory, searchTerm, startDate, endDate, selectedCreators]);

  const getMasterProductsLabel = (entry: LoadHistoryEntry) => {
    if (entry.fullLibrary && entry.fullLibrary.length > 0) {
      const uniqueProducts = Array.from(new Set(entry.fullLibrary.map(p => p.masterProduct)));
      return uniqueProducts.join(', ');
    }
    return entry.id; 
  };

  // FUNÇÃO DE IMPRESSÃO - LAYOUT "FECHAMENTO DE CARGA INDUSTRIAL" (IGUAL À IMAGEM)
  const handlePrintEntry = (entry: LoadHistoryEntry) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const masterLabel = getMasterProductsLabel(entry);
    const dateFormatted = new Date(entry.timestamp).toLocaleString('pt-BR');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>FECHAMENTO DE CARGA - ${entry.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #001a35; margin: 0; background: white; }
            .header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 5px; border-bottom: 3px solid #FFB800; margin-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 900; font-style: italic; }
            .logo span { color: #FFB800; }
            .header-title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #002855; }
            
            .info-bar { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info-item { display: flex; flex-direction: column; }
            .info-label { font-size: 8px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
            .info-value { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #002855; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
            th { background: #002855; color: white; padding: 10px; font-size: 9px; text-transform: uppercase; text-align: left; }
            td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 10px; font-weight: 700; color: #002855; }
            
            .notes-box { margin-top: 20px; padding: 15px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #f8fafc; }
            .notes-label { font-size: 8px; font-weight: 900; color: #002855; text-transform: uppercase; margin-bottom: 5px; display: block; }
            .notes-content { font-size: 10px; color: #475569; white-space: pre-wrap; }

            .total-bar { display: flex; justify-content: flex-end; align-items: center; background: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; }
            .total-label { font-size: 10px; font-weight: 900; text-transform: uppercase; margin-right: 20px; }
            .total-value { font-size: 18px; font-weight: 950; color: #002855; }

            .section-title-bar { background: #002855; color: white; padding: 8px 15px; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-top: 40px; }
            .consolidated-table td { font-size: 10px; padding: 10px; }

            .audit-box { margin-top: 60px; border: 1.5px solid #002855; border-radius: 8px; padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
            .audit-box h4 { grid-column: span 3; font-size: 9px; font-weight: 900; text-transform: uppercase; margin: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }

            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">S<span>Ó</span> AÇO</div>
            <div class="header-title">FECHAMENTO DE CARGA INDUSTRIAL</div>
          </div>

          <div class="info-bar">
            <div class="info-item">
              <span class="info-label">DATA DO REGISTRO:</span>
              <span class="info-value">${dateFormatted}</span>
            </div>
            <div class="info-item" style="text-align: right;">
              <span class="info-label">PRODUTO(S):</span>
              <span class="info-value">${masterLabel}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 80px;">CÓDIGO</th>
                <th>DESCRIÇÃO</th>
                <th>MATERIAL</th>
                <th>ESPECIFICAÇÃO</th>
                <th style="text-align: center; width: 60px;">QTD</th>
                <th style="text-align: right; width: 100px;">TOTAL (KG)</th>
              </tr>
            </thead>
            <tbody>
              ${entry.fullLibrary ? entry.fullLibrary.map(item => `
                <tr>
                  <td style="font-weight: 900;">${item.partCode}</td>
                  <td style="text-transform: uppercase;">${item.description}</td>
                  <td style="text-transform: uppercase;">${item.materialName}</td>
                  <td style="font-style: italic; color: #475569;">${item.dimensions}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${item.totalWeight.toFixed(2)}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">DETALHAMENTO INDISPONÍVEL PARA ESTE REGISTRO ANTIGO</td></tr>
              `}
            </tbody>
          </table>

          ${entry.notes ? `
            <div class="notes-box">
              <span class="notes-label">OBSERVAÇÕES GERAIS DO PROJETO</span>
              <div class="notes-content">${entry.notes}</div>
            </div>
          ` : ''}

          <div class="total-bar">
            <span class="total-label">PESO BRUTO TOTAL:</span>
            <span class="total-value">${entry.totalWeight.toFixed(2)} KG</span>
          </div>

          <div class="section-title-bar">RESUMO CONSOLIDADO DE CARGA</div>
          <table class="consolidated-table" style="border: 1px solid #e2e8f0; border-top: none;">
            <tbody>
              ${entry.details.map(stat => `
                <tr>
                  <td style="width: 60%;">${stat.material} | ${stat.spec}</td>
                  <td style="text-align: center;">${stat.count} UN</td>
                  <td style="text-align: right; font-weight: 900;">${stat.weight.toFixed(2)} KG</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="audit-box">
            <h4>PROTOCOLO DE AUDITORIA DE FECHAMENTO DE CARGA</h4>
            <div class="info-item">
              <span class="info-label">OPERADOR DE FECHAMENTO</span>
              <span class="info-value">${entry.createdBy || 'SISTEMA'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">CARGO / FUNÇÃO</span>
              <span class="info-value">${entry.createdByRole || 'ADMINISTRADOR'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">DATA DE AUDITORIA</span>
              <span class="info-value">${dateFormatted}</span>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedCreators([]);
    setIsUserMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-[#002855] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border-b-8 border-[#FFB800]">
        <History className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none w-48 h-48" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1.5 bg-[#FFB800] rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB800]">SÓ AÇO - Auditoria de Carga</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Histórico de Fechamentos</h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50 relative">
           <div className="flex items-center gap-3 flex-1 min-w-[200px]">
             <Search className="w-5 h-5 text-slate-400" />
             <input 
                type="text" 
                placeholder="Pesquisar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[#002855] w-full uppercase placeholder:text-slate-300"
             />
           </div>

           {/* Usuários Multi-select */}
           <div className="relative px-3 border-l border-slate-200" ref={userMenuRef}>
             <button 
               onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
               className="flex items-center gap-2 text-[10px] font-black uppercase text-[#002855] hover:text-[#FFB800] transition-colors"
             >
               <UserCircle className="w-4 h-4" />
               USUÁRIO {selectedCreators.length > 0 ? `(${selectedCreators.length})` : ''}
               <ChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
             </button>
             {isUserMenuOpen && (
               <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                 <div className="p-2 border-b border-slate-50 mb-1">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Selecionar Usuários</span>
                 </div>
                 <div className="max-h-60 overflow-y-auto custom-scrollbar">
                   {availableUsers.map(userName => (
                     <button key={userName} onClick={() => toggleSelection(userName)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left">
                       <span className="text-[10px] font-black text-[#002855] uppercase">{userName}</span>
                       {selectedCreators.includes(userName) && <Check className="w-3 h-3 text-[#FFB800] stroke-[4]" />}
                     </button>
                   ))}
                 </div>
               </div>
             )}
           </div>

           <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
             <DatePicker value={startDate} onChange={setStartDate} placeholder="Início" className="w-32" />
             <DatePicker value={endDate} onChange={setEndDate} placeholder="Fim" className="w-32" />
           </div>

          <div className="flex gap-3">
             <button 
                onDoubleClick={() => setLoadHistory([])} 
                className="px-6 py-3 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                title="CLIQUE DUPLO PARA LIMPAR TODO O HISTÓRICO"
             >
                <Eraser className="w-4 h-4" /> Limpar Histórico
             </button>
             {(searchTerm || startDate || endDate || selectedCreators.length > 0) && (
                <button onClick={clearFilters} className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-md active:scale-90 flex items-center gap-2 text-[9px] font-black uppercase">
                  <XCircle className="w-4 h-4" /> Limpar Filtros
                </button>
             )}
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#002855] text-white">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Produto Master</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Data</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Usuário Origem</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right bg-[#001a35]">Peso Bruto</th>
              <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest">Auditoria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#002855] uppercase">{getMasterProductsLabel(entry)}</span>
                      <span className="text-[9px] font-bold text-slate-400">REF: {entry.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center"><span className="text-[11px] font-black">{new Date(entry.timestamp).toLocaleDateString('pt-BR')}</span></td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-black text-[#002855] uppercase">{entry.createdBy || 'SISTEMA'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right bg-slate-50/50"><span className="text-lg font-black text-[#002855]">{entry.totalWeight.toFixed(2)} KG</span></td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handlePrintEntry(entry)} className="flex items-center gap-2 px-4 py-2.5 bg-[#002855] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#001a35] transition-all shadow-md">
                        <Printer className="w-3.5 h-3.5 text-[#FFB800]" /> Auditoria
                      </button>
                      <button 
                        onDoubleClick={(e) => handleDoubleClickDelete(entry.id, e)} 
                        className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-rose-500 rounded-full transition-all shadow-sm border border-slate-100 hover:border-rose-500 group"
                        title="CLIQUE DUPLO PARA EXCLUIR"
                      >
                        <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Vazio...</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryView;
