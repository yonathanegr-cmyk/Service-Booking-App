import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from './ui/icons';
import { Category } from '../hooks/useCategories';

export type { Category };

interface CategorySelectorProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string, name: string) => void;
  title?: string;
  isLoading?: boolean;
}

export function CategorySelector({ 
  categories, 
  selectedId, 
  onSelect,
  title = "מה אנחנו מתקנים היום?",
  isLoading = false
}: CategorySelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 150;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-5 relative">
      {title && (
        <p className="text-[10px] text-gray-400 font-bold mb-2 tracking-wide">
          {title}
        </p>
      )}
      
      {/* Container with navigation arrows */}
      <div className="relative group">
        
        {/* Left Arrow (shows more on the right in RTL) */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Right Arrow (shows more on the left in RTL) */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          dir="rtl"
          onWheel={(e) => {
            if (scrollRef.current && e.deltaY !== 0) {
              e.preventDefault();
              scrollRef.current.scrollLeft += e.deltaY;
            }
          }}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-2 rounded-xl border bg-gray-50 animate-pulse flex-shrink-0 min-w-[60px]"
              >
                <div className="w-6 h-6 bg-gray-200 rounded-full mb-1" />
                <div className="w-8 h-2 bg-gray-200 rounded" />
              </div>
            ))
          ) : (
            categories.map((category) => {
              const displayName = category.nameHe || category.name;
              const isSelected = selectedId === displayName;
              return (
                <button
                  key={category.id}
                  onClick={() => onSelect(category.id, displayName)}
                  className={`
                    flex flex-col items-center justify-center 
                    p-2 rounded-xl border transition-all
                    flex-shrink-0 min-w-[60px]
                    ${isSelected 
                      ? 'bg-blue-50 border-blue-200 shadow-sm scale-95' 
                      : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:scale-105'
                    }
                  `}
                >
                  <span className="text-xl mb-1 filter drop-shadow-sm">
                    {category.icon}
                  </span>
                  <span className={`
                    text-[10px] font-bold whitespace-nowrap
                    ${isSelected ? 'text-blue-700' : 'text-gray-600'}
                  `}>
                    {displayName}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Fade indicators */}
        {canScrollRight && (
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        )}
        {canScrollLeft && (
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}
      </div>

      {/* Selection indicator */}
      {selectedId && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 font-medium animate-in fade-in slide-in-from-bottom-1 duration-200">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>נבחר: {selectedId}</span>
        </div>
      )}
    </div>
  );
}

// CSS to hide scrollbar (add to global styles if not using Tailwind plugin)
const scrollbarHideStyles = `
  .category-selector-scroll::-webkit-scrollbar {
    display: none;
  }
`;
