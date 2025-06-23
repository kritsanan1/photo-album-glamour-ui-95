
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Calendar, Image, Tag, SortAsc } from 'lucide-react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onSort: (sort: SortOption) => void;
  totalPhotos: number;
  filteredPhotos: number;
}

interface FilterOptions {
  dateRange?: { start: Date; end: Date };
  fileType?: string[];
  sizeRange?: { min: number; max: number };
  tags?: string[];
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';

export default function SearchAndFilter({ 
  onSearch, 
  onFilter, 
  onSort, 
  totalPhotos, 
  filteredPhotos 
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  useEffect(() => {
    onSort(sortBy);
  }, [sortBy, onSort]);

  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
    
    if (filterPanelRef.current) {
      if (!isFilterOpen) {
        gsap.fromTo(filterPanelRef.current,
          { opacity: 0, y: -20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.2)" }
        );
      } else {
        gsap.to(filterPanelRef.current, {
          opacity: 0,
          y: -20,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in"
        });
      }
    }
  };

  const fileTypes = [
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/gif', label: 'GIF' },
    { value: 'image/webp', label: 'WebP' }
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'วันที่ล่าสุด' },
    { value: 'date-asc', label: 'วันที่เก่าสุด' },
    { value: 'name-asc', label: 'ชื่อ A-Z' },
    { value: 'name-desc', label: 'ชื่อ Z-A' },
    { value: 'size-desc', label: 'ขนาดใหญ่สุด' },
    { value: 'size-asc', label: 'ขนาดเล็กสุด' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Search Bar */}
      <div className="flex gap-4 items-center mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหารูปภาพ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <button
          onClick={toggleFilterPanel}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200",
            isFilterOpen 
              ? "bg-orange-500 text-white border-orange-500" 
              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
          )}
        >
          <Filter className="w-5 h-5" />
          ตัวกรอง
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>
          แสดง {filteredPhotos.toLocaleString()} จาก {totalPhotos.toLocaleString()} รูปภาพ
        </span>
        {searchQuery && (
          <span>
            ผลการค้นหา: "{searchQuery}"
          </span>
        )}
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div
          ref={filterPanelRef}
          className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* File Type Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Image className="w-4 h-4" />
              ประเภทไฟล์
            </label>
            <div className="space-y-2">
              {fileTypes.map(type => (
                <label key={type.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.fileType?.includes(type.value) || false}
                    onChange={(e) => {
                      const currentTypes = filters.fileType || [];
                      if (e.target.checked) {
                        setFilters({
                          ...filters,
                          fileType: [...currentTypes, type.value]
                        });
                      } else {
                        setFilters({
                          ...filters,
                          fileType: currentTypes.filter(t => t !== type.value)
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4" />
              ช่วงวันที่
            </label>
            <div className="space-y-2">
              <input
                type="date"
                onChange={(e) => {
                  const start = new Date(e.target.value);
                  setFilters({
                    ...filters,
                    dateRange: { start, end: filters.dateRange?.end || new Date() }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="date"
                onChange={(e) => {
                  const end = new Date(e.target.value);
                  setFilters({
                    ...filters,
                    dateRange: { start: filters.dateRange?.start || new Date(), end }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Size Range Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <SortAsc className="w-4 h-4" />
              ขนาดไฟล์ (MB)
            </label>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="ขั้นต่ำ"
                onChange={(e) => {
                  const min = parseFloat(e.target.value) * 1024 * 1024;
                  setFilters({
                    ...filters,
                    sizeRange: { min, max: filters.sizeRange?.max || Infinity }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="สูงสุด"
                onChange={(e) => {
                  const max = parseFloat(e.target.value) * 1024 * 1024;
                  setFilters({
                    ...filters,
                    sizeRange: { min: filters.sizeRange?.min || 0, max }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Tag className="w-4 h-4" />
              การกระทำ
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setFilters({})}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ล้างตัวกรอง
              </button>
              <button
                onClick={toggleFilterPanel}
                className="w-full px-3 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                ปิดตัวกรอง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
