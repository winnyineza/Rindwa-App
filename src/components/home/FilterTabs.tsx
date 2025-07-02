
import { Badge } from '@/components/ui/badge';

interface FilterTabsProps {
  selectedFilter: 'all' | 'emergency' | 'safety' | 'community';
  onFilterChange: (filter: 'all' | 'emergency' | 'safety' | 'community') => void;
}

export function FilterTabs({ selectedFilter, onFilterChange }: FilterTabsProps) {
  const filters = [
    { key: 'all', label: 'Latest', count: null },
    { key: 'emergency', label: 'Fire', count: 3 },
    { key: 'safety', label: 'Accident', count: 5 },
    { key: 'community', label: 'Security', count: 2 }
  ] as const;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Filter & Sort</h2>
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filter.label}</span>
              {filter.count && (
                <Badge 
                  variant="secondary" 
                  className={`h-5 w-5 p-0 flex items-center justify-center text-xs ${
                    selectedFilter === filter.key 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {filter.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
