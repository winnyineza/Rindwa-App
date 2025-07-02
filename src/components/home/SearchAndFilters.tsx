
import { useState } from 'react';
import { Search, Filter, Calendar, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}

interface FilterOptions {
  categories: string[];
  status: string[];
  dateRange: string;
  distance: string;
}

export function SearchAndFilters({ onSearch, onFilter, activeFilters }: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'fire', label: 'Fire Emergency', icon: '🔥' },
    { value: 'medical', label: 'Medical', icon: '🚑' },
    { value: 'accident', label: 'Accident', icon: '🚗' },
    { value: 'security', label: 'Security', icon: '🚔' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const toggleCategory = (category: string) => {
    const newCategories = activeFilters.categories.includes(category)
      ? activeFilters.categories.filter(c => c !== category)
      : [...activeFilters.categories, category];
    
    onFilter({ ...activeFilters, categories: newCategories });
  };

  const toggleStatus = (status: string) => {
    const newStatus = activeFilters.status.includes(status)
      ? activeFilters.status.filter(s => s !== status)
      : [...activeFilters.status, status];
    
    onFilter({ ...activeFilters, status: newStatus });
  };

  const clearAllFilters = () => {
    onFilter({
      categories: [],
      status: [],
      dateRange: '',
      distance: ''
    });
    setSearchQuery('');
    onSearch('');
  };

  const activeFilterCount = 
    activeFilters.categories.length + 
    activeFilters.status.length + 
    (activeFilters.dateRange ? 1 : 0) + 
    (activeFilters.distance ? 1 : 0);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex space-x-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search incidents by title, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Time Range</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFilter({ ...activeFilters, dateRange: 'today' })}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter({ ...activeFilters, dateRange: 'week' })}>
                  This Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter({ ...activeFilters, dateRange: 'month' })}>
                  This Month
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  Distance
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Distance from you</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFilter({ ...activeFilters, distance: '1km' })}>
                  Within 1 km
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter({ ...activeFilters, distance: '5km' })}>
                  Within 5 km
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter({ ...activeFilters, distance: '10km' })}>
                  Within 10 km
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            {/* Category Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.value}
                    variant={activeFilters.categories.includes(category.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category.value)}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Badge
                    key={status.value}
                    variant={activeFilters.status.includes(status.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(status.value)}
                  >
                    {status.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.categories.map((category) => (
              <Badge key={category} variant="secondary" className="cursor-pointer" onClick={() => toggleCategory(category)}>
                {categories.find(c => c.value === category)?.icon} {category}
                <span className="ml-1">×</span>
              </Badge>
            ))}
            {activeFilters.status.map((status) => (
              <Badge key={status} variant="secondary" className="cursor-pointer" onClick={() => toggleStatus(status)}>
                {status}
                <span className="ml-1">×</span>
              </Badge>
            ))}
            {activeFilters.dateRange && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFilter({ ...activeFilters, dateRange: '' })}>
                {activeFilters.dateRange}
                <span className="ml-1">×</span>
              </Badge>
            )}
            {activeFilters.distance && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFilter({ ...activeFilters, distance: '' })}>
                {activeFilters.distance}
                <span className="ml-1">×</span>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
