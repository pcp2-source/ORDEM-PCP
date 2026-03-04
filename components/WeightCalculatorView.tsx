
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, Layers, Square, Circle, RefreshCw, Info, 
  Calculator, Zap, Maximize, Box as BoxIcon, 
  Save, Trash2, History, BookOpen, Search, 
  ArrowDownCircle, CheckCircle2, Lock, AlertTriangle,
  Printer, FileSpreadsheet, Download, FileText, Rotate3d,
  ShieldCheck, Eraser
} from 'lucide-react';
import { SheetMaterial, TubeRoundMaterial, MetalonSquareMaterial, MetalonRectMaterial, SystemUser } from '../types';

type ShapeType = 'sheet' | 'tube-round' | 'tube-square' | 'tube-rect' | 'rebar';

interface CalculationEntry {
  id: string;
  timestamp: string;
  shape: ShapeType;
  materialName: string;
  dimensions: string;
  unitWeight: number;
  totalWeight: number;
  quantity: number;
}

interface Props {
  sheets?: SheetMaterial[];
  tubesRound?: TubeRoundMaterial[];
  tubesSquare?: MetalonSquareMaterial[];
  tubesRect?: MetalonRectMaterial[];
  activeUser: SystemUser | null;
}

const WeightCalculatorView: React.FC<Props> = ({ 
  sheets = [], tubesRound = [], tubesSquare = [], tubesRect = [], activeUser
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
  
  const [history, setHistory] = useState<CalculationEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  const materials = [
    { name: 'Aço Carbono', density: 7.85 },
    { name: 'Aço Inox 304/316', density: 8.00 },
    { name: 'Aço Inox 430', density: 7.75 },
    { name: 'Alumínio', density: 2.70 },
    { name: 'Cobre', density: 8.96 },
    { name: 'Latão', density: 8.50 },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('sa_weight_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sa_weight_history', JSON.stringify(history));
  }, [history]);

  const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) {
        resetTechnicalFields();
        return;
    }

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

    return {
      unit: unitWeight,
      total: unitWeight * quantity
    };
  }, [shape, density, thickness, width, height, length, diameter, quantity, sheetWidthManual, wallManual]);

  const saveToHistory = () => {
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

    const entry: CalculationEntry = {
      id: `PESO-${Math.floor(Math.random() * 9000) + 1000}`,
      timestamp: new Date().toISOString(),
      shape,
      materialName: matName,
      dimensions: dims,
      unitWeight: calculation.unit,
      totalWeight: calculation.total,
      quantity
    };

    setHistory([entry, ...history]);
  };

  const removeHistoryItem = (id: string) => setHistory(history.filter(h => h.id !== id));
  
  const clearFullHistory = () => { 
    setHistory([]); 
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalLogWeight = history.reduce((acc, curr) => acc + curr.totalWeight, 0);

    const consolidatedMap: Record<string, { material: string, spec: string, weight: number, count: number }> = {};
    history.forEach(item => {
      const baseSpec = item.dimensions.split('|')[0].trim();
      const key = `${item.materialName} | ${baseSpec}`;
      if (!consolidatedMap[key]) {
        consolidatedMap[key] = { material: item.materialName, spec: baseSpec, weight: 0, count: 0 };
      }
      consolidatedMap[key].weight += item.totalWeight;
      consolidatedMap[key].count += item.quantity;
    });
    const consolidatedList = Object.values(consolidatedMap).sort((a, b) => b.weight - a.weight);

    const reportName = `RELATORIO DE PESO TEORICO ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`;

    const html = `
      <html>
        <head>
          <title>${reportName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #001a35; margin: 0; }
            .header { border-bottom: 5px solid #FFB800; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 32px; font-weight: 900; font-style: italic; }
            .logo span { color: #FFB800; }
            .title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #eee; }
            th { background: #001a35; color: white; padding: 12px; font-size: 10px; text-transform: uppercase; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 11px; font-weight: 700; }
            .total-row { background: #f8fafc; font-weight: 900; }
            .consolidated-section { margin-top: 40px; border: 2px solid #001a35; border-radius: 12px; overflow: hidden; page-break-inside: avoid; }
            .consolidated-header { background: #001a35; color: white; padding: 12px 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; }
            .footer-audit { margin-top: 50px; padding: 20px; border: 2pt solid #001a35; border-radius: 12px; background: #f8fafc; page-break-inside: avoid; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"><span>SÓ</span> AÇO</div>
            <div class="title">Relatório de Pesagem Teórica</div>
          </div>
          <p style="font-size: 10px; font-weight: 900; color: #64748b;">DATA DO RELATÓRIO: ${new Date().toLocaleString('pt-BR')}</p>
          
          <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: #001a35; margin-top: 40px; margin-bottom: 10px; border-left: 4px solid #FFB800; padding-left: 10px;">Detalhamento de Itens Pesados</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">ITEM</th>
                <th>MATERIAL</th>
                <th>ESPECIFICAÇÃO</th>
                <th style="text-align: center;">QTD</th>
                <th style="text-align: right;">UNIT (KG)</th>
                <th style="text-align: right;">TOTAL (KG)</th>
              </tr>
            </thead>
            <tbody>
              ${history.map((item, index) => `
                <tr>
                  <td style="font-weight: 900;">${String(index + 1).padStart(2, '0')}</td>
                  <td>${item.materialName}</td>
                  <td style="font-style: italic;">${item.dimensions}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${item.unitWeight.toFixed(3)}</td>
                  <td style="text-align: right;">${item.totalWeight.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5" style="text-align: right; padding: 15px; font-weight: 900;">PESO BRUTO TOTAL:</td>
                <td style="text-align: right; color: #001a35; font-size: 14px; font-weight: 950;">${totalLogWeight.toFixed(2)} KG</td>
              </tr>
            </tbody>
          </table>

          <div class="consolidated-section">
            <div class="consolidated-header">Resumo Consolidado de Carga (Resumo Agregado)</div>
            <table>
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="background: #f8fafc; color: #001a35; border: 1px solid #eee;">MATERIAL</th>
                  <th style="background: #f8fafc; color: #001a35; border: 1px solid #eee;">ESPECIFICAÇÃO BASE</th>
                  <th style="background: #f8fafc; color: #001a35; border: 1px solid #eee; text-align: center;">TOTAL PEÇAS</th>
                  <th style="background: #f8fafc; color: #001a35; border: 1px solid #eee; text-align: right;">PESO AGREGADO (KG)</th>
                </tr>
              </thead>
              <tbody>
                ${consolidatedList.map(stat => `
                  <tr>
                    <td>${stat.material}</td>
                    <td>${stat.spec}</td>
                    <td style="text-align: center;">${stat.count} UN</td>
                    <td style="text-align: right; font-weight: 900; color: #001a35;">${stat.weight.toFixed(2)} KG</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer-audit">
            <p style="font-size: 10px; font-weight: 950; color: #001a35; text-transform: uppercase; margin-bottom: 15px;">Protocolo de Emissão e Auditoria SÓ AÇO</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
              <div>
                <p style="font-size: 7px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Operador Responsável</p>
                <p style="font-size: 11px; font-weight: 950; color: #001a35; text-transform: uppercase;">${activeUser?.name || 'SISTEMA'}</p>
              </div>
              <div>
                <p style="font-size: 7px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Cargo / Função</p>
                <p style="font-size: 11px; font-weight: 950; color: #001a35; text-transform: uppercase;">${activeUser?.role || 'SISTEMA'}</p>
              </div>
              <div>
                <p style="font-size: 7px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Data de Geração</p>
                <p style="font-size: 11px; font-weight: 950; color: #001a35;">${new Date().toLocaleString('pt-BR')}</p>
              </div>
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
    const headers = ['ID', 'Data', 'Material', 'Especificacao', 'Quantidade', 'Peso Unitario (KG)', 'Peso Total (KG)', 'Emitido Por'];
    const rows = history.map(item => [
      item.id,
      new Date(item.timestamp).toLocaleString('pt-BR'),
      item.materialName,
      item.dimensions.replace(/,/g, '.'),
      item.quantity,
      item.unitWeight.toFixed(3),
      item.totalWeight.toFixed(2),
      activeUser?.name || 'SISTEMA'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pesagem_so_aco_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clear = () => {
    resetTechnicalFields();
    setSelectedId('');
    setLength('2000');
    setWallManual('1.5');
    setSheetWidthManual('1000');
    setQuantity(1);
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

  const getCatalogLabel = () => {
    switch(shape) {
      case 'sheet': return 'Chapas';
      case 'tube-round': return 'Tubos Redondos';
      case 'tube-square': return 'Tubos Quadrados';
      case 'tube-rect': return 'Tubos Retangulares';
      case 'rebar': return 'Vergalhões / Redondos';
      default: return 'Materiais';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="bg-[#002855] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border-b-8 border-[#FFB800]">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Scale className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1.5 bg-[#FFB800] rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB800]">SÓ AÇO - Balança Digital</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Cálculo de Pesagem Teórica</h2>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest max-w-md mt-1">Conectado ao seu Cadastro Industrial.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-[#002855] uppercase tracking-widest italic mb-6 flex items-center gap-2">
               <Layers className="w-4 h-4 text-[#FFB800]" /> 1. Formato do Perfil
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ShapeButton active={shape === 'sheet'} onClick={() => { setShape('sheet'); clear(); }} icon={<Layers />} label="Chapa" />
                <ShapeButton active={shape === 'tube-round'} onClick={() => { setShape('tube-round'); clear(); }} icon={<Circle />} label="Tubo Red." />
                <ShapeButton active={shape === 'tube-square'} onClick={() => { setShape('tube-square'); clear(); }} icon={<Square />} label="Metalon Quad." />
                <ShapeButton active={shape === 'tube-rect'} onClick={() => { setShape('tube-rect'); clear(); }} icon={<Maximize />} label="Metalon Ret." />
                <ShapeButton active={shape === 'rebar'} onClick={() => { setShape('rebar'); clear(); }} icon={<Circle className="fill-current" />} label="Vergalão" />
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-[#002855]/5 shadow-xl relative">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-[#002855] uppercase tracking-[0.2em] italic flex items-center gap-3">
                 <Calculator className="w-5 h-5 text-[#FFB800]" /> 2. Configuração de Medição (mm)
               </h3>
               <span className="bg-[#002855] text-[#FFB800] text-[8px] font-black px-3 py-1 rounded-full uppercase">Integração SÓ AÇO</span>
             </div>

             <div className="mb-10 animate-in zoom-in-95 duration-500">
               <div className={`border-4 rounded-[2rem] p-10 group transition-all ${selectedId ? 'bg-amber-50 border-[#FFB800] shadow-lg' : 'bg-[#002855]/5 border-[#002855]/10 hover:border-[#FFB800]'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1 space-y-3">
                      <label className="text-xs font-black text-[#002855] uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#FFB800]" /> {getCatalogLabel()}
                      </label>
                    </div>
                    <div className="flex-1 relative">
                      <select 
                        value={selectedId}
                        onChange={handleSelection}
                        className="w-full pl-14 pr-8 py-5 rounded-2xl bg-white border-2 border-slate-200 font-black text-[#002855] outline-none text-lg shadow-sm group-hover:shadow-md transition-all appearance-none cursor-pointer"
                      >
                        <option value="">-- SELECIONE O PERFIL --</option>
                        {getActiveCatalog().map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.thickness || s.side || s.diameter || `${s.width}x${s.height}`} mm)</option>
                        ))}
                      </select>
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shape === 'sheet' && <DimensionInput label="Largura Variável (W)" value={sheetWidthManual} onChange={setSheetWidthManual} highlight={!!selectedId} />}
                {shape !== 'sheet' && shape !== 'rebar' && <DimensionInput label="Parede Manual (e)" value={wallManual} onChange={setWallManual} highlight={!!selectedId} />}
                {shape === 'rebar' && <DimensionInput label="Diâmetro (Ø)" value={diameter} onChange={setDiameter} highlight={!!selectedId} />}
                <DimensionInput label="Comprimento (L)" value={length} onChange={setLength} highlight={!!selectedId} />
                <div className="space-y-3 p-4 bg-[#FFB800]/5 rounded-3xl border border-[#FFB800]/10">
                  <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest ml-1">Qtd de Peças</label>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))} className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-[#FFB800]/20 font-black text-[#002855] outline-none text-2xl shadow-inner" />
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#002855] p-10 rounded-[3rem] shadow-2xl text-white relative border-b-[12px] border-[#FFB800]">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#FFB800] mb-10 italic">Resultado Balança</h3>
            <div className="space-y-10">
              <div className="group">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Peso Unitário</p>
                <div className="flex items-baseline gap-2"><span className="text-5xl font-black italic tracking-tighter">{calculation.unit.toFixed(3)}</span><span className="text-lg font-bold text-[#FFB800] uppercase">kg</span></div>
              </div>
              <div className="pt-10 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Carga Bruta do Lote</p>
                <div className="flex items-baseline gap-2"><span className="text-7xl font-black text-[#FFB800] tracking-tighter tabular-nums">{calculation.total.toFixed(2)}</span><span className="text-2xl font-bold uppercase">kg</span></div>
              </div>
            </div>
            <button onClick={saveToHistory} disabled={calculation.total <= 0 || !selectedId} className="w-full mt-12 py-6 bg-[#FFB800] text-[#002855] font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 disabled:opacity-20"><Save className="w-6 h-6" /> Registrar Pesagem</button>
          </div>
        </div>
      </div>

      <div className="space-y-8 mt-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-2xl font-black text-[#002855] uppercase tracking-tighter italic flex items-center gap-3">
            <History className="w-6 h-6 text-[#FFB800]" /> Log de Registro
          </h3>
          <div className="flex flex-wrap gap-3">
             <button 
                onDoubleClick={clearFullHistory} 
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 cursor-help"
                title="CLIQUE DUPLO PARA LIMPAR REGISTRO"
             >
                <Eraser className="w-4 h-4" /> Limpar Registro
             </button>
             <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-[#002855] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#001a35] transition-all shadow-md">
                <Printer className="w-4 h-4 text-[#FFB800]" /> PDF Auditoria
             </button>
             <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md">
                <FileSpreadsheet className="w-4 h-4" /> Excel
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#002855] text-white">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Material</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Especificação</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Qtd</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Unitário</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right bg-[#001a35]">Total</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Sem registros recentes</td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-8 py-4"><span className="text-xs font-black text-[#002855] uppercase">{item.materialName}</span></td>
                        <td className="px-8 py-4 text-[11px] font-black text-[#002855] italic tracking-tight">{item.dimensions}</td>
                        <td className="px-8 py-4 text-center text-xs font-black text-[#002855]">{item.quantity}</td>
                        <td className="px-8 py-4 text-right text-[11px] font-black text-slate-500">{item.unitWeight.toFixed(3)} KG</td>
                        <td className="px-8 py-4 text-right bg-slate-50/50 text-base font-black text-[#002855] tracking-tighter">{item.totalWeight.toFixed(2)} KG</td>
                        <td className="px-8 py-4 text-center">
                          <button 
                            onDoubleClick={() => removeHistoryItem(item.id)} 
                            className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-rose-500 rounded-full transition-all shadow-sm border border-transparent hover:border-rose-500 group"
                            title="CLIQUE DUPLO PARA REMOVER"
                          >
                            <Trash2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DimensionInput = ({ label, value, onChange, highlight }: any) => (
  <div className="space-y-3">
    <label className={`text-[10px] font-black uppercase tracking-widest block transition-colors ${highlight ? 'text-[#FFB800]' : 'text-slate-400'}`}>{label}</label>
    <div className="relative">
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 font-black text-[#002855] outline-none text-xl transition-all shadow-inner ${highlight ? 'border-[#FFB800] bg-amber-50' : 'border-slate-100 focus:border-[#002855]'}`} />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">mm</div>
    </div>
  </div>
);

const ShapeButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${active ? 'bg-[#002855] border-[#002855] text-white shadow-xl scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-[#FFB800]/50'}`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-white/10 text-[#FFB800]' : 'bg-white text-slate-300'}`}>{React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}</div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default WeightCalculatorView;
