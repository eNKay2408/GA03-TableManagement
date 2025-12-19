import React from 'react';
import { FaFilter, FaSort, FaTimes } from 'react-icons/fa';

const FilterSortPanel = ({ 
  filters, 
  setFilters, 
  sortConfig, 
  setSortConfig,
  onReset 
}) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSortChange = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <div className="filter-sort-panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <FaFilter className="panel-icon" />
          Lọc & Sắp xếp
          {getActiveFiltersCount() > 0 && (
            <span className="filter-count">{getActiveFiltersCount()}</span>
          )}
        </h3>
        {getActiveFiltersCount() > 0 && (
          <button 
            className="btn btn-sm btn-secondary"
            onClick={onReset}
            title="Xóa tất cả bộ lọc"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <div className="panel-content">
        <div className="filter-section">
          <h4 className="section-title">Bộ lọc</h4>
          
          <div className="filter-group">
            <label className="filter-label">Trạng thái:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              <option value="Active">Kích hoạt</option>
              <option value="Inactive">Tạm ngưng</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Khu vực:</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Patio">Patio</option>
              <option value="VIP Room">VIP Room</option>
            </select>
          </div>
        </div>

        <div className="sort-section">
          <h4 className="section-title">Sắp xếp</h4>
          
          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortConfig.field === 'number' ? 'active' : ''}`}
              onClick={() => handleSortChange('number')}
            >
              <FaSort className="sort-icon" />
              Mã bàn {getSortIcon('number')}
            </button>

            <button
              className={`sort-btn ${sortConfig.field === 'capacity' ? 'active' : ''}`}
              onClick={() => handleSortChange('capacity')}
            >
              <FaSort className="sort-icon" />
              Sức chứa {getSortIcon('capacity')}
            </button>

            <button
              className={`sort-btn ${sortConfig.field === 'createdAt' ? 'active' : ''}`}
              onClick={() => handleSortChange('createdAt')}
            >
              <FaSort className="sort-icon" />
              Ngày tạo {getSortIcon('createdAt')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSortPanel;