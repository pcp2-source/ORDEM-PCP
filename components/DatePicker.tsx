
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(selectedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const isSelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getDate() === day && d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-[#002855] uppercase tracking-widest mb-2 block ml-1 flex items-center gap-2">
          <CalendarIcon className="w-3 h-3 text-[#FFB800]" /> {label}
        </label>
      )}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#FFB800] outline-none font-bold text-[#002855] cursor-pointer flex items-center justify-between hover:border-[#FFB800]/50 transition-all"
      >
        <span className={value ? "text-[#002855]" : "text-slate-400"}>
          {value ? new Date(value).toLocaleDateString('pt-BR') : placeholder || 'Selecionar data'}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-5 bg-white rounded-3xl shadow-2xl border border-slate-200 w-72 animate-in zoom-in-95 duration-200 origin-top">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#002855]" />
            </button>
            <div className="text-center">
              <p className="text-xs font-black text-[#002855] uppercase tracking-tighter">
                {months[viewDate.getMonth()]}
              </p>
              <p className="text-[10px] font-bold text-slate-400">{viewDate.getFullYear()}</p>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronRight className="w-4 h-4 text-[#002855]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(d => (
              <div key={d} className="text-center text-[8px] font-black text-slate-400 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {blanks.map(i => <div key={`blank-${i}`} />)}
            {days.map(day => (
              <button
                key={day}
                onClick={() => handleDateSelect(day)}
                className={`
                  aspect-square flex items-center justify-center text-[11px] font-black rounded-xl transition-all
                  ${isSelected(day) ? 'bg-[#002855] text-white' : 'hover:bg-[#FFB800]/20 text-[#002855]'}
                  ${isToday(day) && !isSelected(day) ? 'border-2 border-[#FFB800]' : ''}
                `}
              >
                {day}
              </button>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
             <button 
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
             >
               Limpar
             </button>
             <button 
              onClick={() => setIsOpen(false)}
              className="text-[9px] font-black text-[#002855] uppercase tracking-widest hover:underline"
             >
               Fechar
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
