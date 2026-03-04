
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ProductionOrder, OrderStatus, Priority, ProductionSector, ProductionSubSector, SystemUser } from '../types';
import { 
  MessageSquare, 
  Trash2, 
  Package, 
  MapPin, 
  Clock, 
  Printer, 
  Calendar as CalendarIcon,
  XCircle,
  Table as TableIcon,
  Factory,
  History,
  Activity,
  AlertCircle,
  LayoutGrid,
  FileSpreadsheet,
  FileText,
  SearchX,
  ListFilter,
  Check,
  ChevronDown,
  Copy,
  ShieldCheck,
  User,
  UserCircle,
  ClipboardList
} from 'lucide-react';
import DatePicker from './DatePicker';

interface Props {
  orders: ProductionOrder[];
  sectors: ProductionSector[];
  subSectors: ProductionSubSector[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
  onNotify: (order: ProductionOrder) => void;
  onReplicate: (order: ProductionOrder) => void;
  searchQuery?: string;
  activeUser: SystemUser | null;
  users: SystemUser[];
}

const OrderListView: React.FC<Props> = ({ 
  orders, 
  sectors, 
  subSectors, 
  onUpdateStatus, 
  onDelete, 
  onNotify,
  onReplicate,
  searchQuery = '',
  activeUser,
  users
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<string[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus[]>([]);
  
  const [activeDropdown, setActiveDropdown] = useState<'sector' | 'subsector' | 'creator' | 'status' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [expandedOrders, setExpandedOrders] = useState<Record<string, 'items' | 'history' | null>>({});

  // Lista oficial de usuários proveniente do sistema
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

  const toggleSelection = (list: any[], setList: (val: any[]) => void, item: any) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const toggleExpand = (id: string, mode: 'items' | 'history') => {
    setExpandedOrders(prev => ({ 
      ...prev, 
      [id]: prev[id] === mode ? null : mode 
    }));
  };

  const isExpired = (deadline: string, status: OrderStatus) => {
    if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' || 
        order.id.toLowerCase().includes(query) ||
        order.clientName.toLowerCase().includes(query) ||
        order.productName.toLowerCase().includes(query) ||
        (order.notes && order.notes.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      let dateMatch = true;
      if (startDate || endDate) {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && end) {
          end.setHours(23, 59, 59);
          dateMatch = orderDate >= start && orderDate <= end;
        } else if (start) {
          dateMatch = orderDate >= start;
        } else if (end) {
          end.setHours(23, 59, 59);
          dateMatch = orderDate <= end;
        }
      }
      if (!dateMatch) return false;

      if (selectedSectors.length > 0 && !selectedSectors.includes(order.sector)) return false;
      if (selectedSubSectors.length > 0 && order.subSector && !selectedSubSectors.includes(order.subSector)) return false;
      if (selectedCreators.length > 0 && order.createdBy && !selectedCreators.includes(order.createdBy)) return false;
      if (selectedStatus.length > 0 && !selectedStatus.includes(order.status)) return false;

      return true;
    });
  }, [orders, startDate, endDate, selectedSectors, selectedSubSectors, selectedCreators, selectedStatus, searchQuery]);

  const handleDoubleClickDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedCreators([]);
    setSelectedStatus([]);
    setActiveDropdown(null);
  };

  // FUNÇÃO DE IMPRESSÃO (ESTRUTURA TÉCNICA REFINADA)
  const handlePrintOrder = (order: ProductionOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sectorLabel = order.subSector ? `${order.sector} / ${order.subSector}` : order.sector;
    const emissionDate = new Date(order.createdAt).toLocaleDateString('pt-BR');
    const deadlineDate = new Date(order.deadline).toLocaleDateString('pt-BR');
    const isDetailed = order.items && order.items.length > 0;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SÓ AÇO - OP ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 0; 
              color: #001a35; 
              background: white;
            }
            .page {
              width: 100%;
              max-width: 1000px;
              margin: 0 auto;
              padding: 0;
            }
            
            /* Header */
            .header-bar {
              background: #002855;
              padding: 20px 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: white;
            }
            .logo-box {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 28px;
              font-weight: 900;
              font-style: italic;
            }
            .logo-box span { color: #FFB800; }
            .header-title {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              opacity: 0.9;
            }
            .id-box {
              background: #FFB800;
              color: #002855;
              padding: 12px 25px;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            }
            .id-box .label { font-size: 8px; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; }
            .id-box .value { font-size: 24px; font-weight: 900; }

            /* Meta Data Bar */
            .meta-bar {
              background: #f8fafc;
              display: grid;
              grid-template-columns: 1fr 1fr 1fr 1fr;
              padding: 15px 40px;
              border-bottom: 1px solid #e2e8f0;
            }
            .meta-item { display: flex; flex-direction: column; }
            .meta-item .label { font-size: 7px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .meta-item .value { font-size: 11px; font-weight: 900; text-transform: uppercase; }
            .deadline-value { color: #e11d48; }

            /* Section Headers */
            .section-header {
              background: #FFB800;
              color: #002855;
              text-align: center;
              padding: 8px;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-top: 20px;
            }

            /* Tables */
            .product-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #002855;
            }
            .product-table th {
              background: #002855;
              color: white;
              padding: 10px 15px;
              font-size: 9px;
              text-transform: uppercase;
              text-align: left;
            }
            .product-table td {
              padding: 15px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              border: 1px solid #e2e8f0;
            }
            
            /* Simple Mode Styling */
            .simple-mode td {
              padding: 30px 15px;
              font-size: 18px;
              font-weight: 900;
            }
            .qty-cell {
              width: 180px;
              text-align: center;
              background: #f8fafc;
              font-weight: 900 !important;
            }

            /* Detailed Mode Table Styling */
            .detailed-table th {
               text-align: center;
            }
            .detailed-table td {
               text-align: center;
               font-size: 11px;
            }
            .col-desc { text-align: left !important; font-weight: 900; font-size: 12px !important; }

            /* Notes Box */
            .notes-section {
              margin: 20px 40px;
              padding: 15px;
              background: #f8fafc;
              border: 1px dashed #cbd5e1;
              border-radius: 8px;
              min-height: 80px;
            }
            .notes-label {
              font-size: 8px;
              font-weight: 900;
              color: #002855;
              text-transform: uppercase;
              margin-bottom: 8px;
              display: block;
            }
            .notes-content {
              font-size: 10px;
              line-height: 1.5;
              color: #475569;
            }

            /* Signatures */
            .signatures {
              margin: 60px 40px 40px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 80px;
            }
            .sig-line {
              border-top: 1.5px solid #002855;
              text-align: center;
              padding-top: 8px;
              font-size: 9px;
              font-weight: 900;
              text-transform: uppercase;
              color: #002855;
            }

            .master-product-banner {
              background: #001a35;
              color: white;
              padding: 12px 40px;
              font-size: 14px;
              font-weight: 900;
              text-transform: uppercase;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            @media print {
              body { -webkit-print-color-adjust: exact; }
              .page { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header-bar">
              <div class="logo-box">S<span>Ó</span> AÇO</div>
              <div class="header-title">ORDEM DE SERVIÇO INDUSTRIAL</div>
              <div class="id-box">
                <div class="label">ID DA ORDEM:</div>
                <div class="value">${order.id}</div>
              </div>
            </div>

            <div class="meta-bar">
              <div class="meta-item">
                <div class="label">SETOR / SUB-SETOR</div>
                <div class="value">${sectorLabel}</div>
              </div>
              <div class="meta-item">
                <div class="label">CLIENTE / DESTINO</div>
                <div class="value">${order.clientName}</div>
              </div>
              <div class="meta-item">
                <div class="label">DATA EMISSÃO</div>
                <div class="value">${emissionDate}</div>
              </div>
              <div class="meta-item">
                <div class="label">PRAZO ENTREGA</div>
                <div class="value deadline-value">${deadlineDate}</div>
              </div>
            </div>

            ${isDetailed ? `
              <div class="master-product-banner">
                <span>PRODUTO MASTER: ${order.productName}</span>
                <span style="font-size: 10px; opacity: 0.7;">ORDEM DETALHADA</span>
              </div>
              
              <div class="section-header">DETALHAMENTO TÉCNICO DAS PEÇAS</div>
              <table class="product-table detailed-table">
                <thead>
                  <tr>
                    <th style="width: 60px;">CÓD.</th>
                    <th class="col-desc">DESCRIÇÃO DA PEÇA</th>
                    <th style="width: 100px;">L (MM)</th>
                    <th style="width: 100px;">A (MM)</th>
                    <th style="width: 60px;">QTD</th>
                    <th>MATÉRIA PRIMA</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items!.map(item => `
                    <tr>
                      <td style="font-weight: 900; color: #64748b;">${item.partCode}</td>
                      <td class="col-desc">${item.description}</td>
                      <td style="color: #c2410c; font-weight: 900;">${item.medidaL || '---'}</td>
                      <td style="color: #c2410c; font-weight: 900;">${item.medidaA || '---'}</td>
                      <td style="background: #f8fafc; font-weight: 900;">${item.quantity}</td>
                      <td style="font-style: italic; text-align: left;">${item.material || '---'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div class="section-header">IDENTIFICAÇÃO DO PRODUTO</div>
              <table class="product-table simple-mode">
                <thead>
                  <tr>
                    <th>DESCRIÇÃO DO ITEM A SER PRODUZIDO</th>
                    <th class="qty-cell">QUANTIDADE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${order.productName}</td>
                    <td class="qty-cell">${order.quantity} ${order.unit.toUpperCase()}</td>
                  </tr>
                </tbody>
              </table>
            `}

            <div class="notes-section">
              <span class="notes-label">INSTRUÇÕES E OBSERVAÇÕES TÉCNICAS</span>
              <div class="notes-content">
                ${order.notes && order.notes.trim() !== "" ? order.notes : "Sem observações adicionais para esta ordem."}
              </div>
            </div>

            <div class="signatures">
              <div class="sig-line">PRODUÇÃO / ENCARREGADO</div>
              <div class="sig-line">QUALIDADE / CONFERÊNCIA</div>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>SÓ AÇO - Relatório de Ordens</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #001a35; }
            .header { border-bottom: 4px solid #FFB800; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 24px; font-weight: 900; font-style: italic; }
            .logo span { color: #FFB800; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #001a35; color: white; padding: 10px; font-size: 10px; text-transform: uppercase; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #eee; font-size: 10px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"><span>SÓ</span> AÇO</div>
            <div style="font-size: 12px; font-weight: 900;">RELATÓRIO CONSOLIDADO DE PRODUÇÃO</div>
          </div>
          <p style="font-size: 9px; color: #64748b; font-weight: 900;">EMITIDO EM: ${new Date().toLocaleString('pt-BR')}</p>
          <table>
            <thead>
              <tr><th>ID</th><th>GERADA EM</th><th>CLIENTE</th><th>PRODUTO</th><th>SETOR</th><th>SUB SETOR</th><th>QTD</th><th>PRAZO</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              ${filteredOrders.map(o => `
                <tr>
                  <td>${o.id}</td>
                  <td>${new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>${o.clientName}</td>
                  <td>${o.productName}</td>
                  <td>${o.sector}</td>
                  <td>${o.subSector || '---'}</td>
                  <td>${o.quantity} ${o.unit}</td>
                  <td>${new Date(o.deadline).toLocaleDateString('pt-BR')}</td>
                  <td>${o.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Data Criacao', 'Cliente', 'Produto', 'Setor', 'Sub-Setor', 'Qtd', 'Prazo', 'Status'];
    const rows = filteredOrders.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleDateString('pt-BR'),
      o.clientName,
      o.productName,
      o.sector,
      o.subSector || '',
      `${o.quantity} ${o.unit}`,
      new Date(o.deadline).toLocaleDateString('pt-BR'),
      o.status
    ]);
    
    // Properly quote fields and use semicolon as delimiter for better Excel compatibility in Brazil
    const csvContent = [
      headers.join(';'), 
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ordens_so_aco_${new Date().getTime()}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-emerald-600 text-white border-emerald-700';
      case OrderStatus.IN_PROGRESS: return 'bg-[#FFB800] text-[#002855] border-[#002855] font-black shadow-sm';
      case OrderStatus.CANCELLED: return 'bg-rose-600 text-white border-rose-700';
      default: return 'bg-slate-400 text-white border-slate-500';
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-1.5 bg-[#FFB800] rounded-full"></div>
            <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tighter italic">Painel Industrial</h2>
          </div>
          <p className="text-slate-500 font-bold ml-1 uppercase text-[8px] tracking-[0.2em]">Fluxo de Trabalho SÓ AÇO</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[1.2rem] border border-slate-200 shadow-sm relative" ref={dropdownRef}>
          {/* Setores Multi-select */}
          <div className="relative px-2 border-r border-slate-100">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'sector' ? null : 'sector')}
              className="flex items-center gap-2 text-[9px] font-black uppercase text-[#002855] hover:text-[#FFB800] transition-colors"
            >
              <Factory className="w-4 h-4" />
              SETOR {selectedSectors.length > 0 ? `(${selectedSectors.length})` : ''}
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

          {/* Sub-Setores Multi-select */}
          <div className="relative px-2 border-r border-slate-100">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'subsector' ? null : 'subsector')}
              className="flex items-center gap-2 text-[9px] font-black uppercase text-[#002855] hover:text-[#FFB800] transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              SUB {selectedSubSectors.length > 0 ? `(${selectedSubSectors.length})` : ''}
              <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'subsector' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'subsector' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {subSectors.map(s => (
                    <button key={s.id} onClick={() => toggleSelection(selectedSubSectors, setSelectedSubSectors, s.name)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left">
                      <span className="text-[10px] font-black text-[#002855] uppercase">{s.name}</span>
                      {selectedSubSectors.includes(s.name) && <Check className="w-3 h-3 text-[#FFB800] stroke-[4]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Usuários Multi-select */}
          <div className="relative px-2 border-r border-slate-100">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'creator' ? null : 'creator')}
              className="flex items-center gap-2 text-[9px] font-black uppercase text-[#002855] hover:text-[#FFB800] transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              USUÁRIO {selectedCreators.length > 0 ? `(${selectedCreators.length})` : ''}
              <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'creator' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'creator' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {availableUsers.map(userName => (
                    <button key={userName} onClick={() => toggleSelection(selectedCreators, setSelectedCreators, userName)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left">
                      <span className="text-[10px] font-black text-[#002855] uppercase">{userName}</span>
                      {selectedCreators.includes(userName) && <Check className="w-3 h-3 text-[#FFB800] stroke-[4]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Multi-select */}
          <div className="relative px-2 border-r border-slate-100">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className="flex items-center gap-2 text-[9px] font-black uppercase text-[#002855] hover:text-[#FFB800] transition-colors"
            >
              <ListFilter className="w-4 h-4" />
              STATUS {selectedStatus.length > 0 ? `(${selectedStatus.length})` : ''}
              <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'status' && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                {Object.values(OrderStatus).map(status => (
                  <button key={status} onClick={() => toggleSelection(selectedStatus, setSelectedStatus, status)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left">
                    <span className="text-[10px] font-black text-[#002855] uppercase">{status}</span>
                    {selectedStatus.includes(status) && <Check className="w-3 h-3 text-[#FFB800] stroke-[4]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          
          <div className="flex items-center gap-2">
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Início" className="w-32" />
            <DatePicker value={endDate} onChange={setEndDate} placeholder="Fim" className="w-32" />
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <div className="flex items-center gap-2">
             <button onClick={handlePrintReport} className="flex items-center gap-2 px-3 py-2 bg-[#002855] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#001a35] transition-all shadow-sm">
                <Printer className="w-3.5 h-3.5 text-[#FFB800]" /> PDF Lista
             </button>
             <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm">
                <FileSpreadsheet className="w-3.5 h-3.5" /> XLS
             </button>
          </div>

          {(startDate || endDate || selectedSectors.length > 0 || selectedSubSectors.length > 0 || selectedCreators.length > 0 || selectedStatus.length > 0) && (
            <button onClick={clearFilters} className="ml-1 px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all shadow-md active:scale-90 flex items-center gap-2 text-[9px] font-black uppercase">
              <XCircle className="w-4 h-4" /> Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
            <SearchX className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Sem ordens para os filtros selecionados.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const expired = isExpired(order.deadline, order.status);
            const isExpanded = expandedOrders[order.id];

            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border-l-[6px] ${
                  expired ? 'border-l-red-600 bg-rose-50/30' : 'border-l-[#002855]'
                }`}
              >
                <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                           <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md flex items-center gap-1 ${expired ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-[#002855]'}`}>
                              <Factory className="w-3 h-3" /> {order.sector}
                           </span>
                           {order.subSector && (
                             <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md flex items-center gap-1 ${expired ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                <LayoutGrid className="w-3 h-3" /> {order.subSector}
                             </span>
                           )}
                           <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${expired ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-[#FFB800] text-[#002855] border-[#002855]/10'}`}>
                              ID: {order.id}
                           </span>
                           <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-100 flex items-center gap-1">
                              <User className="w-2.5 h-2.5" /> CRIADO POR: {order.createdBy || 'SISTEMA'}
                           </span>
                        </div>
                        <h3 className="text-xl font-black text-[#002855] leading-tight italic uppercase tracking-tighter">
                          {order.productName}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">
                          <MapPin className="w-3.5 h-3.5 text-[#FFB800]" />
                          <span className="font-black text-[10px] uppercase text-[#002855] tracking-tight">{order.clientName}</span>
                        </div>
                        <div className={`text-[9px] uppercase font-black px-3 py-1 rounded-lg border shadow-inner mt-1 ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`${expired ? 'bg-red-700' : 'bg-[#002855]'} p-3 rounded-xl text-white shadow-sm relative overflow-hidden`}>
                        <Package className="absolute -right-2 -bottom-2 w-10 h-10 text-white/5 rotate-12" />
                        <p className="text-[8px] uppercase font-black text-white/40 tracking-widest mb-0.5">Qtd Total</p>
                        <p className="text-base font-black">{order.quantity} <span className="text-[9px] font-bold text-[#FFB800] uppercase">{order.unit}</span></p>
                      </div>
                      
                      <div className={`p-3 rounded-xl border flex flex-col justify-center ${expired ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                        <p className={`text-[8px] uppercase font-black tracking-widest mb-0.5 flex items-center gap-1 ${expired ? 'text-red-500' : 'text-slate-400'}`}>
                           <Clock className="w-2.5 h-2.5" /> Prazo
                        </p>
                        <p className={`text-xs font-black ${expired ? 'text-red-700' : 'text-[#002855]'}`}>
                          {new Date(order.deadline).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {order.items && order.items.length > 0 && (
                          <button 
                            onClick={() => toggleExpand(order.id, 'items')}
                            className={`flex-1 p-3 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm ${
                              isExpanded === 'items' ? 'bg-[#002855] text-white' : 'bg-[#FFB800] text-[#002855] hover:bg-[#ffc933]'
                            }`}
                          >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Peças</span>
                          </button>
                        )}
                        <button 
                          onClick={() => toggleExpand(order.id, 'history')}
                          className={`flex-1 p-3 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm border ${
                            isExpanded === 'history' ? 'bg-[#002855] text-white' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <History className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Auditoria</span>
                        </button>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Alterar Status</p>
                        <select 
                          value={order.status}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className="w-full text-[9px] font-black uppercase bg-transparent border-none p-0 outline-none text-[#002855] cursor-pointer"
                        >
                          {Object.values(OrderStatus).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 lg:pl-5 lg:border-l border-slate-100">
                    <button onClick={() => onReplicate(order)} className="flex items-center gap-2 px-4 py-3 bg-[#002855] text-white hover:bg-[#001a35] rounded-xl transition-all active:scale-95 shadow-md">
                      <Copy className="w-4 h-4 text-[#FFB800]" /><span className="text-[10px] font-black uppercase tracking-widest">Replicar</span>
                    </button>
                    <button onClick={() => handlePrintOrder(order)} className={`flex items-center gap-2 px-4 py-3 bg-white text-[#002855] hover:bg-[#002855] hover:text-white rounded-xl border-2 border-[#002855] transition-all active:scale-95 shadow-md`}>
                      <Printer className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">PDF OP</span>
                    </button>
                    <button onClick={() => onNotify(order)} className={`p-3 bg-[#25D366] text-white hover:bg-[#128C7E] rounded-xl transition-all shadow-md active:scale-90`}><MessageSquare className="w-4.5 h-4.5" /></button>
                    <button onDoubleClick={(e) => handleDoubleClickDelete(order.id, e)} className="p-3 text-slate-300 hover:text-white hover:bg-rose-500 rounded-lg transition-all"><Trash2 className="w-4.5 h-4.5" /></button>
                  </div>
                </div>

                {/* ÁREA DE EXPANSÃO: DETALHAMENTO TÉCNICO DAS PEÇAS */}
                {isExpanded === 'items' && order.items && (
                  <div className="bg-slate-50 border-t border-slate-200 p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardList className="w-4 h-4 text-[#002855]" />
                      <h4 className="text-[10px] font-black text-[#002855] uppercase tracking-widest">Detalhamento Técnico das Peças</h4>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#002855] text-white text-[9px] font-black uppercase tracking-widest">
                            <th className="px-4 py-3 w-16 text-center">Cód</th>
                            <th className="px-4 py-3">Descrição da Peça</th>
                            <th className="px-4 py-3 text-center">L (mm)</th>
                            <th className="px-4 py-3 text-center">A (mm)</th>
                            <th className="px-4 py-3 text-center">Qtd</th>
                            <th className="px-4 py-3">Matéria Prima</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-2.5 text-center text-[10px] font-black text-slate-400">{item.partCode}</td>
                              <td className="px-4 py-2.5 text-[10px] font-black text-[#002855] uppercase">{item.description}</td>
                              <td className="px-4 py-2.5 text-center text-[11px] font-black text-orange-700">{item.medidaL || '---'}</td>
                              <td className="px-4 py-2.5 text-center text-[11px] font-black text-orange-700">{item.medidaA || '---'}</td>
                              <td className="px-4 py-2.5 text-center text-[11px] font-black text-[#002855]">{item.quantity}</td>
                              <td className="px-4 py-2.5 text-[10px] font-bold text-slate-500 italic uppercase">{item.material || 'NÃO ESPECIFICADO'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ÁREA DE EXPANSÃO: HISTÓRICO DE AUDITORIA */}
                {isExpanded === 'history' && (
                  <div className="bg-slate-50 border-t border-slate-200 p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-4 h-4 text-[#002855]" />
                      <h4 className="text-[10px] font-black text-[#002855] uppercase tracking-widest">Histórico de Alterações (Auditoria)</h4>
                    </div>
                    <div className="space-y-2">
                      {order.history.map((log) => (
                        <div key={log.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-[#002855] uppercase">{log.userName}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.action}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-black text-[#002855]">{new Date(log.timestamp).toLocaleDateString()}</p>
                            <p className="text-[9px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderListView;
