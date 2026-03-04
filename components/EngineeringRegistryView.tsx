
import React, { useState, useMemo } from 'react';
import { 
  Compass, Layers, Square, Circle, Maximize, 
  Save, Trash2, History as HistoryIcon, BookOpen, Search, 
  ArrowDownCircle, CheckCircle2, Lock, AlertTriangle,
  Printer, FileSpreadsheet, Rotate3d, Box,
  Tag, Code, ClipboardList, Briefcase, X, Eraser,
  Scale, Calculator, ChevronDown, ChevronUp, Clock,
  Calendar, Archive, Eye, Activity, Weight, Beaker
} from 'lucide-react';
import { SheetMaterial, TubeRoundMaterial, MetalonSquareMaterial, MetalonRectMaterial, LoadHistoryEntry, EngineeringPart, SystemUser } from '../types';

type ShapeType = 'sheet' | 'tube-round' | 'tube-square' | 'tube-rect' | 'rebar';

interface Props {
  sheets?: SheetMaterial[];
  tubesRound?: TubeRoundMaterial[];
  tubesSquare?: MetalonSquareMaterial[];
  tubesRect?: MetalonRectMaterial[];
  loadHistory: LoadHistoryEntry[];
  setLoadHistory: (history: LoadHistoryEntry[]) => void;
  library: EngineeringPart[];
  setLibrary: React.Dispatch<React.SetStateAction<EngineeringPart[]>>;
  activeUser: SystemUser | null;
}

const EngineeringRegistryView: React.FC<Props> = ({ 
  sheets = [], tubesRound = [], tubesSquare = [], tubesRect = [],
  loadHistory, setLoadHistory, library, setLibrary, activeUser
}) => {
  const [shape, setShape] = useState<ShapeType>('sheet');
  const [density, setDensity] = useState(7.85);
  
  const [thickness, setThickness] = useState<string>('0'); 
  const [width, setWidth] = useState<string>('0'); 
  const [height, setHeight] = useState<string>('0'); 
  const [diameter, setDiameter] = useState<string>('0'); 
  
  const [wallManual, setWallManual] = useState<string>('1.5'); 
  const [length, setLength] = useState<string>('2000'); 
  const [sheetWidthManual, setSheetWidthManual] = useState<string>('1000');
  const [quantity, setQuantity] = useState<number>(1);
  
  const [masterProduct, setMasterProduct] = useState<string>('');
  const [partCode, setPartCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');

  const materials = [
    { name: 'Aço Carbono', density: 7.85 },
    { name: 'Aço Inox 304/316', density: 8.00 },
    { name: 'Aço Inox 430', density: 7.75 },
    { name: 'Alumínio', density: 2.70 },
    { name: 'Cobre', density: 8.96 },
    { name: 'Latão', density: 8.50 },
  ];

  const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) { resetTechnicalFields(); return; }

    if (shape === 'sheet') {
      const s = sheets.find(x => x.id === id);
      if (s) setThickness(s.thickness);
    } else if (shape === 'tube-round') {
      const s = tubesRound.find(x => x.id === id);
      if (s) setDiameter(s.diameter);
    } else if (shape === 'tube-square') {
      const s = tubesSquare.find(x => x.id === id);
      if (s) setWidth(s.side);
    } else if (shape === 'tube-rect') {
      const s = tubesRect.find(x => x.id === id);
      if (s) { setWidth(s.width); setHeight(s.height); }
    }
  };

  const resetTechnicalFields = () => {
    setThickness('0'); setWidth('0'); setHeight('0'); setDiameter('0');
  };

  const getActiveCatalog = () => {
    switch(shape) {
      case 'sheet': return sheets;
      case 'tube-round': return tubesRound;
      case 'tube-square': return tubesSquare;
      case 'tube-rect': return tubesRect;
      case 'rebar': return tubesRound; // Reuso do catálogo de tubos para diâmetros
      default: return [];
    }
  };

  const calculation = useMemo(() => {
    const t = parseFloat(thickness.replace(',', '.')) || 0;
    const p = parseFloat(wallManual.replace(',', '.')) || 0;
    const w = shape === 'sheet' ? parseFloat(sheetWidthManual.replace(',', '.')) : parseFloat(width.replace(',', '.')) || 0;
    const h = parseFloat(height.replace(',', '.')) || 0;
    const l = parseFloat(length.replace(',', '.')) || 0;
    const d = parseFloat(diameter.replace(',', '.')) || 0;
    
    let unitWeight = 0;
    if (shape === 'sheet') {
      unitWeight = (t * w * l * density) / 1000000;
    } else if (shape === 'tube-round') {
      const rExt = d / 2;
      const rInt = rExt - p;
      if (rInt >= 0) {
        const area = Math.PI * (Math.pow(rExt, 2) - Math.pow(rInt, 2));
        unitWeight = (area * l * density) / 1000000;
      }
    } else if (shape === 'tube-square') {
      const sideInt = w - (2 * p);
      if (sideInt >= 0) {
        const area = Math.pow(w, 2) - Math.pow(sideInt, 2);
        unitWeight = (area * l * density) / 1000000;
      }
    } else if (shape === 'tube-rect') {
      const baseInt = w - (2 * p);
      const heightInt = h - (2 * p);
      if (baseInt >= 0 && heightInt >= 0) {
        const area = (w * h) - (baseInt * heightInt);
        unitWeight = (area * l * density) / 1000000;
      }
    } else if (shape === 'rebar') {
      const area = Math.PI * Math.pow(d / 2, 2);
      unitWeight = (area * l * density) / 1000000;
    }
    return { unit: unitWeight, total: unitWeight * quantity };
  }, [shape, density, thickness, width, height, length, diameter, sheetWidthManual, wallManual, quantity]);

  const registerToLibrary = () => {
    if (!partCode || !masterProduct) {
        alert("Obrigatório informar o Produto Master e o Código da Peça!");
        return;
    }
    const matName = materials.find(m => m.density === density)?.name || 'Personalizado';
    let dims = "";
    if (shape === 'sheet') {
        const s = sheets.find(x => x.id === selectedId);
        dims = `${s?.name || 'CHAPA'} (E:${thickness}mm) | ${sheetWidthManual}x${length} mm`;
    } else if (shape === 'tube-round') {
        const s = tubesRound.find(x => x.id === selectedId);
        dims = `${s?.name || 'TUBO'} (Ø:${diameter} E:${wallManual}mm) | L:${length} mm`;
    } else if (shape === 'tube-square') {
        const s = tubesSquare.find(x => x.id === selectedId);
        dims = `${s?.name || 'METALON'} (${width}x${width} E:${wallManual}mm) | L:${length} mm`;
    } else if (shape === 'tube-rect') {
        const s = tubesRect.find(x => x.id === selectedId);
        dims = `${s?.name || 'METALON'} (${width}x${height} E:${wallManual}mm) | L:${length} mm`;
    } else if (shape === 'rebar') {
        const s = tubesRound.find(x => x.id === selectedId);
        dims = `${s?.name || 'VERGALÃO'} (Ø:${diameter}mm) | L:${length} mm`;
    }

    const entry: EngineeringPart = {
      id: Math.random().toString(36).substr(2, 9),
      masterProduct: masterProduct.toUpperCase(),
      partCode: partCode.toUpperCase(),
      timestamp: new Date().toISOString(),
      shape,
      materialName: matName,
      dimensions: dims,
      unitWeight: calculation.unit,
      totalWeight: calculation.total,
      quantity: quantity,
      description: description.toUpperCase() || 'SEM DESCRIÇÃO'
    };

    setLibrary(prev => [entry, ...prev]);
    setPartCode('');
    setDescription('');
    setQuantity(1);
  };

  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLibrary(prev => prev.filter(item => item.id !== id));
  };

  const handleClearLibrary = () => {
    setLibrary([]);
  };

  const groupedLibrary = useMemo(() => {
    const groups: Record<string, EngineeringPart[]> = {};
    library.forEach(item => {
      if (!groups[item.masterProduct]) groups[item.masterProduct] = [];
      groups[item.masterProduct].push(item);
    });
    return groups;
  }, [library]);

  const consolidatedStats = useMemo(() => {
    const stats: Record<string, { totalWeight: number, count: number, material: string, spec: string }> = {};
    library.forEach(item => {
      const baseSpec = item.dimensions.split('|')[0].trim();
      const key = `${item.materialName} | ${baseSpec}`;
      if (!stats[key]) {
        stats[key] = { totalWeight: 0, count: 0, material: item.materialName, spec: baseSpec };
      }
      stats[key].totalWeight += item.totalWeight;
      stats[key].count += item.quantity;
    });
    return Object.values(stats).sort((a, b) => b.totalWeight - a.totalWeight);
  }, [library]);

  const saveToHistory = () => {
    if (library.length === 0) { alert("Biblioteca vazia."); return; }
    const totalWeight = library.reduce((acc, curr) => acc + curr.totalWeight, 0);
    const entry: LoadHistoryEntry = {
      id: `LC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      totalWeight,
      itemsCount: library.length,
      createdBy: activeUser?.name || 'SISTEMA',
      createdByRole: activeUser?.role || 'SISTEMA',
      details: consolidatedStats.map(s => ({ material: s.material, spec: s.spec, weight: s.totalWeight, count: s.count })),
      fullLibrary: [...library],
      notes: generalNotes.toUpperCase()
    };
    setLoadHistory([entry, ...loadHistory]);
    alert("Fechamento registrado!");
  };

  // LAYOUT DE FECHAMENTO DE CARGA INDUSTRIAL (CONFORME IMAGEM)
  const handlePrintLibrary = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalWeight = library.reduce((acc, curr) => acc + curr.totalWeight, 0);
    const masterProductName = library.length > 0 ? library[0].masterProduct : (masterProduct || 'GERAL');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>FECHAMENTO DE CARGA - ${masterProductName}</title>
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
              <span class="info-value">${new Date().toLocaleString('pt-BR')}</span>
            </div>
            <div class="info-item" style="text-align: right;">
              <span class="info-label">PRODUTO(S):</span>
              <span class="info-value">${masterProductName}</span>
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
              ${library.map(item => `
                <tr>
                  <td style="font-weight: 900;">${item.partCode}</td>
                  <td style="text-transform: uppercase;">${item.description}</td>
                  <td style="text-transform: uppercase;">${item.materialName}</td>
                  <td style="font-style: italic; color: #475569;">${item.dimensions}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${item.totalWeight.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${generalNotes ? `
            <div class="notes-box">
              <span class="notes-label">OBSERVAÇÕES GERAIS DO PROJETO</span>
              <div class="notes-content">${generalNotes}</div>
            </div>
          ` : ''}

          <div class="total-bar">
            <span class="total-label">PESO BRUTO TOTAL:</span>
            <span class="total-value">${totalWeight.toFixed(2)} KG</span>
          </div>

          <div class="section-title-bar">RESUMO CONSOLIDADO DE CARGA</div>
          <table class="consolidated-table" style="border: 1px solid #e2e8f0; border-top: none;">
            <tbody>
              ${consolidatedStats.map(stat => `
                <tr>
                  <td style="width: 60%;">${stat.material} | ${stat.spec}</td>
                  <td style="text-align: center;">${stat.count} UN</td>
                  <td style="text-align: right; font-weight: 900;">${stat.totalWeight.toFixed(2)} KG</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="audit-box">
            <h4>PROTOCOLO DE AUDITORIA DE FECHAMENTO DE CARGA</h4>
            <div class="info-item">
              <span class="info-label">OPERADOR DE FECHAMENTO</span>
              <span class="info-value">${activeUser?.name || 'SISTEMA'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">CARGO / FUNÇÃO</span>
              <span class="info-value">${activeUser?.role || 'ADMINISTRADOR'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">DATA DE AUDITORIA</span>
              <span class="info-value">${new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExportExcel = () => {
    if (library.length === 0) {
      alert("Biblioteca vazia.");
      return;
    }

    const masterProductName = library.length > 0 ? library[0].masterProduct : (masterProduct || 'GERAL');
    const headers = ['Produto Master', 'Cod. Peca', 'Descricao', 'Material', 'Especificacao', 'Quantidade', 'Peso Unitario (KG)', 'Peso Total (KG)'];
    
    const rows = library.map(item => [
      item.masterProduct,
      item.partCode,
      item.description,
      item.materialName,
      item.dimensions.replace(/;/g, ','), // Evitar conflito com delimitador
      item.quantity,
      item.unitWeight.toFixed(3),
      item.totalWeight.toFixed(2)
    ]);

    // Usar ponto e vírgula como delimitador para compatibilidade com Excel no Brasil
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${masterProductName.toLowerCase().replace(/\s+/g, '_')}_so_aco.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="bg-[#002855] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border-b-8 border-[#FFB800]">
        <Compass className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none w-48 h-48" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1.5 bg-[#FFB800] rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB800]">SÓ AÇO - Engenharia Industrial</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Biblioteca de Engenharia</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ShapeButton active={shape === 'sheet'} onClick={() => { setShape('sheet'); resetTechnicalFields(); }} icon={<Layers />} label="Chapa" />
                <ShapeButton active={shape === 'tube-round'} onClick={() => { setShape('tube-round'); resetTechnicalFields(); }} icon={<Circle />} label="Tubo Red." />
                <ShapeButton active={shape === 'tube-square'} onClick={() => { setShape('tube-square'); resetTechnicalFields(); }} icon={<Square />} label="Metalon Quad." />
                <ShapeButton active={shape === 'tube-rect'} onClick={() => { setShape('tube-rect'); resetTechnicalFields(); }} icon={<Maximize />} label="Metalon Ret." />
                <ShapeButton active={shape === 'rebar'} onClick={() => { setShape('rebar'); resetTechnicalFields(); }} icon={<Circle className="fill-current" />} label="Vergalão" />
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-[#002855]/5 shadow-xl">
             <div className="space-y-8">
                <div className="space-y-3 p-8 bg-[#002855]/5 rounded-[2rem] border-2 border-dashed border-[#002855]/10">
                  <label className="text-[11px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-3"><Briefcase className="w-5 h-5 text-[#FFB800]" /> Produto Master</label>
                  <input type="text" value={masterProduct} onChange={e => setMasterProduct(e.target.value)} placeholder="NOME DO PRODUTO MASTER" className="w-full px-8 py-6 rounded-2xl bg-white border-4 border-[#002855]/10 font-black text-[#002855] outline-none text-2xl focus:border-[#FFB800] uppercase" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-2"><Code className="w-3 h-3 text-[#FFB800]" /> Cód. Peça</label>
                      <input type="text" value={partCode} onChange={e => setPartCode(e.target.value)} placeholder="Ex: 01" className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] text-xl outline-none focus:border-[#FFB800] uppercase" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-2"><Tag className="w-3 h-3 text-[#FFB800]" /> Descrição</label>
                      <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: PERNA" className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] text-xl outline-none focus:border-[#FFB800] uppercase" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-2"><Beaker className="w-3 h-3 text-[#FFB800]" /> Material / Liga</label>
                      <select 
                        onChange={(e) => setDensity(parseFloat(e.target.value))} 
                        className="w-full px-6 py-5 rounded-2xl bg-[#FFB800]/5 border-2 border-[#FFB800]/20 font-black text-[#002855] text-lg outline-none focus:border-[#FFB800] appearance-none cursor-pointer"
                      >
                        {materials.map(m => <option key={m.name} value={m.density}>{m.name.toUpperCase()}</option>)}
                      </select>
                    </div>
                </div>

                <div className="border-4 rounded-[2rem] p-8 bg-[#002855]/5 border-[#002855]/10">
                  <select value={selectedId} onChange={handleSelection} className="w-full pl-6 pr-8 py-5 rounded-2xl bg-white border-2 border-slate-200 font-black text-[#002855] outline-none text-lg shadow-sm focus:border-[#FFB800] transition-all cursor-pointer">
                    <option value="">-- SELECIONAR DO CATÁLOGO DE PERFIS --</option>
                    {getActiveCatalog().map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.thickness || s.side || s.diameter || `${s.width}x${s.height}`} mm)</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {shape === 'sheet' ? <DimensionInput label="Largura (W)" value={sheetWidthManual} onChange={setSheetWidthManual} /> : (shape === 'rebar' ? <DimensionInput label="Diâmetro (Ø)" value={diameter} onChange={setDiameter} /> : <DimensionInput label="Parede (e)" value={wallManual} onChange={setWallManual} />)}
                  <DimensionInput label="Comprimento (L)" value={length} onChange={setLength} />
                  <div className="space-y-3"><label className="text-[10px] font-black text-[#002855] uppercase tracking-widest block">Qtd</label><input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] text-xl shadow-inner outline-none focus:border-[#FFB800]" /></div>
                </div>

                <div className="space-y-3 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <label className="text-[11px] font-black text-[#002855] uppercase tracking-widest ml-1 flex items-center gap-3"><ClipboardList className="w-5 h-5 text-[#FFB800]" /> Observações Gerais do Fechamento</label>
                  <textarea 
                    value={generalNotes} 
                    onChange={e => setGeneralNotes(e.target.value)} 
                    placeholder="INSIRA AQUI OBSERVAÇÕES QUE SERÃO EXIBIDAS NO RELATÓRIO PDF (EX: INSTRUÇÕES DE PINTURA, EMBALAGEM, ETC)" 
                    className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-slate-200 font-bold text-[#002855] outline-none min-h-[120px] focus:border-[#FFB800] uppercase text-sm"
                  />
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[3rem] border-2 border-slate-100 shadow-xl relative overflow-hidden group min-h-[350px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white">
             <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-[#FFB800] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,184,0,0.5)]"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Preview Técnico 3D</p>
             </div>
             <div className="absolute top-6 right-6">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-[#FFB800]/10 group-hover:border-[#FFB800]/20 transition-all">
                  <Rotate3d className="w-4 h-4 text-slate-300 group-hover:text-[#FFB800] transition-colors" />
                </div>
             </div>
             
             <div className="w-full h-64 flex items-center justify-center perspective-1200 mt-2">
                <Shape3D 
                  shape={shape} 
                  w={shape === 'sheet' ? parseFloat(sheetWidthManual) : parseFloat(width)} 
                  h={parseFloat(height)} 
                  l={parseFloat(length)} 
                  t={parseFloat(thickness)} 
                  p={parseFloat(wallManual)} 
                  d={parseFloat(diameter)} 
                />
             </div>
          </div>

          <div className="bg-[#002855] p-10 rounded-[3rem] shadow-2xl text-white border-b-[12px] border-[#FFB800]">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Peso Teórico Individual</p>
            <div className="flex items-baseline gap-2 mb-10"><span className="text-7xl font-black italic tracking-tighter text-[#FFB800]">{calculation.total.toFixed(3)}</span><span className="text-2xl font-bold text-white uppercase">kg</span></div>
            <button onClick={registerToLibrary} disabled={!selectedId || !partCode || !masterProduct} className="w-full py-6 bg-[#FFB800] text-[#002855] font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 disabled:opacity-20"><Save className="w-6 h-6" /> Adicionar à Tabela</button>
          </div>
        </div>
      </div>

      {consolidatedStats.length > 0 && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-4">
             <div className="w-8 h-1.5 bg-[#FFB800] rounded-full"></div>
             <h3 className="text-sm font-black text-[#002855] uppercase tracking-[0.2em] italic flex items-center gap-2">
                <Weight className="w-4 h-4 text-[#FFB800]" /> Resumo de Carga Agregada por Perfil
             </h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {consolidatedStats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border-2 border-[#002855]/5 shadow-sm hover:shadow-md transition-all group">
                   <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-[#002855]/40 uppercase tracking-widest">{stat.material}</p>
                        <h4 className="text-[11px] font-black text-[#002855] uppercase tracking-tight italic leading-tight">{stat.spec}</h4>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-[#FFB800]/10 transition-colors">
                        <Activity className="w-4 h-4 text-slate-300 group-hover:text-[#FFB800]" />
                      </div>
                   </div>
                   <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-3xl font-black text-[#002855] tracking-tighter tabular-nums">{stat.totalWeight.toFixed(2)}</span>
                      <span className="text-xs font-black text-[#FFB800] uppercase">kg</span>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Peças no Lote:</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-black text-[#002855]">{stat.count} UN</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="space-y-8 mt-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-10 bg-[#FFB800] rounded-full"></div>
             <h3 className="text-2xl font-black text-[#002855] uppercase tracking-tighter italic flex items-center gap-3">
               BIBLIOTECA DE ENGENHARIA (ATIVA)
             </h3>
          </div>
          <div className="flex gap-3">
             <button 
                onDoubleClick={handleClearLibrary} 
                className="px-6 py-3 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                title="CLIQUE DUPLO PARA LIMPAR TODA A TABELA"
             >
                <Eraser className="w-4 h-4" /> Limpar Biblioteca
             </button>
             <button onClick={saveToHistory} className="px-6 py-3 bg-[#FFB800] text-[#002855] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-amber-500 transition-all active:scale-95">Registrar Fechamento</button>
             <button onClick={handleExportExcel} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> XLS Excel
             </button>
             <button onClick={handlePrintLibrary} className="px-6 py-3 bg-[#002855] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#001a35] transition-all active:scale-95">Gerar PDF</button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#002855] text-white">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">PRODUTO MASTER / PEÇA</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">ESPECIFICAÇÃO BASE</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">MATERIAL</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">QTD</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">PESO TOTAL (KG)</th>
                  <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(groupedLibrary).length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Vazio...</td></tr>
                ) : (
                  Object.keys(groupedLibrary).sort().map(master => (
                    <React.Fragment key={master}>
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-8 py-3 text-[10px] font-black text-[#002855] uppercase border-y border-slate-100">
                          <span className="inline-block w-2 h-2 bg-[#FFB800] rounded-sm mr-2"></span> 
                          PRODUTO MASTER: {master}
                        </td>
                      </tr>
                      {groupedLibrary[master].map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-all group">
                          <td className="px-8 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-[#002855]">{item.partCode}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{item.description}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-[11px] font-bold text-[#002855] italic">{item.dimensions}</td>
                          <td className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">{item.materialName}</td>
                          <td className="px-8 py-4 text-center font-black text-[#002855] text-sm">{item.quantity}</td>
                          <td className="px-8 py-4 text-right font-black text-[#002855] text-lg tabular-nums">{item.totalWeight.toFixed(3)}</td>
                          <td className="px-8 py-4 text-center">
                            <button 
                              onDoubleClick={(e) => handleRemoveItem(item.id, e)}
                              className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-white hover:bg-rose-500 border border-slate-100 hover:border-rose-500 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90 active:animate-bounce group/btn"
                              title="CLIQUE DUPLO PARA REMOVER PEÇA"
                            >
                              <Trash2 className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .perspective-1200 { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
        .shape-scene { transform: rotateX(-20deg) rotateY(35deg); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

const Shape3D = ({ shape, w, h, l, t, p, d }: { shape: ShapeType, w: number, h: number, l: number, t: number, p: number, d: number }) => {
  const maxDim = Math.max(w || 0, h || 0, l || 0, d || 0, 10);
  const scale = 200 / maxDim; 
  
  const vW = (w || d || 10) * scale;
  const vH = (h || d || 10) * scale;
  const vL = (l || 10) * scale;
  const vT = Math.max((t || p || 2) * scale * 2.5, 4);

  return (
    <div className="preserve-3d shape-scene">
      {shape === 'sheet' && <Box3D width={vW} height={vT} depth={vL} color="#94a3b8" />}
      {shape === 'tube-square' && <Box3D width={vW} height={vW} depth={vL} color="#002855" hollow wall={vT} />}
      {shape === 'tube-rect' && <Box3D width={vW} height={vH} depth={vL} color="#002855" hollow wall={vT} />}
      {(shape === 'tube-round' || shape === 'rebar') && <Cylinder3D radius={vW/2} height={vL} color="#002855" />}
    </div>
  );
};

const Box3D = ({ width, height, depth, color, hollow, wall }: any) => (
  <div className="preserve-3d" style={{ width, height, position: 'relative' }}>
    <div className="absolute inset-0" style={{ background: color, transform: `translateZ(${depth/2}px)`, border: '1px solid rgba(255,255,255,0.2)' }}>
      {hollow && <div className="absolute inset-0 bg-slate-200" style={{ margin: wall }} />}
    </div>
    <div className="absolute inset-0" style={{ background: color, transform: `translateZ(${-depth/2}px) rotateY(180deg)`, border: '1px solid rgba(255,255,255,0.2)' }}>
       {hollow && <div className="absolute inset-0 bg-slate-200" style={{ margin: wall }} />}
    </div>
    <div className="absolute" style={{ width, height: depth, background: color, top: (height - depth)/2, transform: `rotateX(90deg) translateZ(${height/2}px)`, filter: 'brightness(1.3)', border: '1px solid rgba(255,255,255,0.1)' }} />
    <div className="absolute" style={{ width, height: depth, background: color, top: (height - depth)/2, transform: `rotateX(-90deg) translateZ(${height/2}px)`, filter: 'brightness(0.7)', border: '1px solid rgba(255,255,255,0.1)' }} />
    <div className="absolute" style={{ width: depth, height, background: color, left: (width - depth)/2, transform: `rotateY(-90deg) translateZ(${width/2}px)`, filter: 'brightness(0.85)', border: '1px solid rgba(255,255,255,0.1)' }} />
    <div className="absolute" style={{ width: depth, height, background: color, left: (width - depth)/2, transform: `rotateY(90deg) translateZ(${width/2}px)`, filter: 'brightness(1.15)', border: '1px solid rgba(255,255,255,0.1)' }} />
  </div>
);

const Cylinder3D = ({ radius, height, color }: any) => (
  <div className="preserve-3d" style={{ width: radius*2, height: radius*2, position: 'relative' }}>
    {[0, 30, 60, 90, 120, 150].map(deg => (
      <div key={deg} className="absolute" style={{ 
        width: radius*2, height, 
        background: color, 
        top: (radius*2 - height)/2,
        transform: `rotateY(${deg}deg)`,
        filter: `brightness(${0.8 + (Math.sin(deg * Math.PI / 180) * 0.4)})`,
        opacity: 0.9,
        borderRadius: radius
      }} />
    ))}
    <div className="absolute inset-0" style={{ background: color, borderRadius: '50%', transform: `translateZ(${height/2}px)`, filter: 'brightness(1.25)', border: '2px solid rgba(255,255,255,0.1)' }} />
    <div className="absolute inset-0" style={{ background: color, borderRadius: '50%', transform: `translateZ(${-height/2}px)`, filter: 'brightness(0.75)', border: '2px solid rgba(255,255,255,0.1)' }} />
  </div>
);

const DimensionInput = ({ label, value, onChange }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    <div className="relative">
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-black text-[#002855] outline-none text-xl shadow-inner focus:border-[#FFB800] transition-all" /><div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">mm</div>
    </div>
  </div>
);

const ShapeButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all shadow-sm ${active ? 'bg-[#002855] border-[#002855] text-white shadow-xl scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-[#FFB800]/30'}`}>
    <div className={`p-2 rounded-xl transition-colors ${active ? 'text-[#FFB800]' : 'text-slate-300'}`}>{React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}</div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default EngineeringRegistryView;
