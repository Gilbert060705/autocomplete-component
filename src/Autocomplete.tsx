import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFloating, offset, flip, shift, arrow, autoUpdate, useClick, useDismiss, useRole, useInteractions, FloatingPortal, useFocus, FloatingFocusManager } from '@floating-ui/react';
import { Spinner } from './Spinner';


export type AutocompleteOption<T> = T extends string ? T : T & { id?: string | number };
export interface AutocompleteProps<T> {
  options: AutocompleteOption<T>[];
  value: T | T[];
  onChange: (value: T | T[]) => void;
  multiple?: boolean;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  filterOptions?: (options: AutocompleteOption<T>[], inputValue: string) => AutocompleteOption<T>[];
  renderOption?: (option: AutocompleteOption<T>, isSelected: boolean) => React.ReactNode;
  onInputChange?: (value: string) => void;
  getOptionLabel?: (option: AutocompleteOption<T>) => string;
  debounceTime?: number;
}
export const Autocomplete = <T extends string | object>({
  options,
  value,
  onChange,
  multiple = false,
  label,
  description,
  placeholder = 'Search...',
  disabled = false,
  loading = false,
  filterOptions,
  renderOption,
  onInputChange,
  getOptionLabel,
  debounceTime = 300,
}: AutocompleteProps<T>) => {


  const inputRef = useRef<HTMLInputElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const getOptionRef = (index:number) => (node:HTMLLIElement | null) =>{
    optionRefs.current[index] = node;
  }

  const [isOpen, setIsOpen] = useState(false); 
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1); 
  const [debouncedInputValue, setDebouncedInputValue] = useState('');
  

  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value] : [];
  }, [value, multiple]);
  
 
  const getOptionLabelFn = useMemo(() => {
    if (getOptionLabel) return getOptionLabel;
    return (option: AutocompleteOption<T>): string => {
      if (typeof option === 'string') return option;
      return (option as any).label || (option as any).name || JSON.stringify(option);
    };
  }, [getOptionLabel]);


  const filterOptionsFn = useMemo(() => {
    if (filterOptions) return filterOptions;
    
    return (options: AutocompleteOption<T>[], inputVal: string): AutocompleteOption<T>[] => {
      if (!inputVal) return options;
      const normalizedInput = inputVal.toLowerCase(); 
      
      return options.filter(option => {
        const label = getOptionLabelFn(option).toLowerCase();
        return label.includes(normalizedInput);
      });
    };
  }, [filterOptions, getOptionLabelFn]);
  

  const filteredOptions = useMemo(() => {
    return filterOptionsFn(options, debouncedInputValue);
  }, [options, filterOptionsFn, debouncedInputValue]);
  

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift(),
      arrow({ element: arrowRef }),
    ],
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
  });
  
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const focus = useFocus(context);
  
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
    focus,
  ]);
  
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedInputValue(inputValue);
      if (onInputChange) {
        onInputChange(inputValue);
      }
    }, debounceTime);
    
    return () => clearTimeout(timerId);
  }, [inputValue, debounceTime, onInputChange]);
  

  useEffect(() => {
    optionRefs.current = new Array(filteredOptions.length).fill(null);
  }, [filteredOptions]);

  useEffect(() => {
    if(!isOpen || highlightedIndex < 0 ||!listboxRef.current) return;

    const highlightedOption = optionRefs.current[highlightedIndex];
    if(!highlightedOption){
      return;
    }

    setTimeout(() => {
      highlightedOption.scrollIntoView({
        behavior: 'auto',
        block : 'nearest'
      });
    },0);
  }, [highlightedIndex,isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      } else if (e.key === 'Enter' && highlightedIndex !== -1) {
        e.preventDefault();
        handleOptionSelect(filteredOptions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions]);
  

  useEffect(() => {
    if (isOpen && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, filteredOptions.length]);

  const isOptionSelected = (option: AutocompleteOption<T>): boolean => {
    if (selectedValues.length === 0) return false;
    
    if (typeof option === 'string') {
      return selectedValues.some(val => val === option);
    } else {
      return selectedValues.some(val => {
        if ((option as any).id !== undefined && (val as any).id !== undefined) {
          return (option as any).id === (val as any).id;
        }
        return JSON.stringify(val) === JSON.stringify(option);
      });
    }
  };
  

  const handleOptionSelect = (option: AutocompleteOption<T>) => {
    const isSelected = isOptionSelected(option);
    
    if (multiple) {
      if (isSelected) {
        const newValue = selectedValues.filter(val => {
          if (typeof option === 'string') {
            return val !== option;
          } else if ((option as any).id !== undefined) {
            return (val as any).id !== (option as any).id;
          }
          return JSON.stringify(val) !== JSON.stringify(option);
        });
        onChange(newValue as any);
      } else {
        onChange([...selectedValues, option] as any);
      }
      inputRef.current?.focus();
      setInputValue('');
    } else {
      onChange(option as any);
      setInputValue('');
      setIsOpen(false);
    }
  };
  
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) setIsOpen(true);
  };


  const handleRemoveItem = (e: React.MouseEvent, item: AutocompleteOption<T>) => {
    e.stopPropagation();
    if (disabled) return;
    
    if (multiple) {
      const newValue = selectedValues.filter(val => {
        if (typeof item === 'string') {
          return val !== item;
        } else if ((item as any).id !== undefined) {
          return (val as any).id !== (item as any).id;
        }
        return JSON.stringify(val) !== JSON.stringify(item);
      });
      onChange(newValue as any);
    }
  };

  const renderSelectedItems = () => {
    if (!multiple || selectedValues.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {selectedValues.map((item, index) => (
          <div 
            key={typeof item === 'string' ? item : (item as any).id || index}
            className="flex items-center bg-blue-100 text-blue-800 text-sm rounded px-2 py-1"
          >
            <span className="mr-1">{getOptionLabelFn(item as AutocompleteOption<T>)}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => handleRemoveItem(e, item as AutocompleteOption<T>)}
                className="text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div
        ref={refs.setReference}
        className={`relative w-full border-2 ${
          isOpen 
            ? 'border-blue-500 ring-2 ring-blue-300 shadow-md' 
            : 'border-gray-300 hover:border-gray-400'
        } 
        rounded-md transition-all duration-150 ease-in-out
        ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'cursor-text'}`}
        {...getReferenceProps({
          onClick: handleInputClick,
        })}
      >
        <div className="flex flex-wrap items-center p-2 min-h-[42px]">
          {multiple && selectedValues.length > 0 && !isOpen && renderSelectedItems()}
          
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            className={`flex-grow outline-none bg-transparent ${disabled ? 'cursor-not-allowed' : ''}`}
          />
          
          {loading && (
            <div className="flex items-center pr-2">
              <Spinner size="sm" />
            </div>
          )}
        </div>
      </div>
      
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-10 w-[var(--reference-width)] max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg"
              {...getFloatingProps()}
            >
              <div ref={arrowRef} className="arrow" />
              
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-gray-500 text-sm">No options found</div>
              ) : (
                <ul ref={listboxRef} className="py-1" role="listbox">
                  {filteredOptions.map((option, index) => {
                    const isSelected = isOptionSelected(option);
                    const isHighlighted = index === highlightedIndex;
                    
                    return (
                      <li
                        ref={getOptionRef(index)}
                        key={typeof option === 'string' ? option : (option as any).id || index}
                        role="option"
                        aria-selected={isSelected}
                        className={`px-3 py-2 cursor-pointer transition-colors duration-150 ease-in-out ${
                          isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'
                        } ${isSelected ? 'bg-blue-100' : ''}`}
                        onClick={() => handleOptionSelect(option)}
                        data-index={index}
                      >
                        {renderOption ? (
                          renderOption(option, isSelected)
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{getOptionLabelFn(option)}</span>
                            {isSelected && (
                              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
      
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      
      {multiple && selectedValues.length > 0 && isOpen && renderSelectedItems()}
    </div>
  );
};