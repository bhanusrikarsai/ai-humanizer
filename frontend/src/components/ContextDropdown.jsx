import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ContextDropdown({
  options = [],
  value,
  onChange,
  disabled = false,
  label = "Context"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.id === value) || options[0] || { id: value, label: value };

  const handleSelect = (optId) => {
    if (disabled) return;
    onChange(optId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Label and Trigger Button */}
      <div className="flex items-center gap-2">
        {label && (
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase select-none">
            {label}
          </span>
        )}
        
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`group relative flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs sm:text-sm text-white transition-all duration-200 cursor-pointer shadow-md select-none ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'
          } ${
            isOpen
              ? 'bg-[#0f4c5c] ring-2 ring-teal-400/40 shadow-teal-500/40'
              : 'glass-button'
          }`}
        >
          <span className="tracking-tight font-semibold truncate max-w-[150px] sm:max-w-[200px]">
            {selectedOption.label}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-teal-100 transition-transform duration-300 ease-out shrink-0 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Floating Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 z-50 w-64 sm:w-72 p-2 rounded-2xl glass-panel shadow-[0_22px_60px_-15px_rgba(0,0,0,0.5)] animate-dropdown-spring origin-top-right focus:outline-none"
        >
          <div className="flex flex-col gap-1">
            {options.map((option, idx) => {
              const isSelected = option.id === value;
              const hasStar = option.id === 'Academic Essay' || option.hasSparkle;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.id)}
                  style={{ animationDelay: `${idx * 22}ms` }}
                  className={`group relative w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] sm:text-[14.5px] font-normal transition-all duration-200 cursor-pointer animate-menu-item ${
                    isSelected
                      ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold shadow-md shadow-teal-500/25 ring-1 ring-white/30'
                      : 'text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 active:bg-white/80 dark:active:bg-white/15 hover:translate-x-1'
                  }`}
                >
                  <span className="truncate pr-2">{option.label}</span>

                  {/* Active Indicator Chevron or Academic Essay Star */}
                  <div className="flex items-center shrink-0">
                    {isSelected ? (
                      <ChevronDown className="w-4 h-4 text-white transition-transform duration-200" />
                    ) : hasStar ? (
                      <svg
                        className="w-4 h-4 text-teal-400 group-hover:scale-125 transition-all duration-300 animate-star-twinkle"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                      </svg>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
