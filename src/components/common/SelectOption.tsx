/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react'; // Hoặc import từ 'react-icons/fi'

export interface OptionItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

interface SelectOptionProps {
  label?: string;
  options: OptionItem[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
}

function SelectOption({ label, options, value, onChange, placeholder }: SelectOptionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tìm option đang được chọn
  const selectedOption = options.find((opt) => opt.value === value);

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2 text-sm" ref={dropdownRef}>
      {label && <span className="text-gray-500 font-medium">{label}</span>}

      <div className="relative min-w-[180px]">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-200 text-gray-800 font-medium rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm hover:border-gray-300 focus:outline-none transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 truncate">
            {selectedOption?.icon && (
              <span className="text-lg flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu Popup */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <ul className="max-h-60 overflow-y-auto space-y-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.icon && (
                        <span className="text-lg flex-shrink-0">{option.icon}</span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectOption