import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaUsers, FaQrcode, FaFilter } from 'react-icons/fa';
import CreateTableModal from './CreateTableModal';
import EditTableModal from './EditTableModal';
import QRCodeModal from './QRCodeModal';
import FilterSortPanel from './FilterSortPanel';
import './TableManagement.css';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [qrTable, setQrTable] = useState(null);
  const [error, setError] = useState(null);
  
  // Filter and Sort states
  const [filters, setFilters] = useState({
    status: '',
    location: ''
  });
  
  const [sortConfig, setSortConfig] = useState({
    field: 'number',
    direction: 'asc'
  });

  if (error) {
    return (
      <div style={{padding: '20px', background: 'white', margin: '20px', borderRadius: '8px'}}>
        <h2>Error in Table Management</h2>
        <p>Error: {error.message}</p>
        <button onClick={() => setError(null)}>Reload</button>
      </div>
    );
  }

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    try {
      const mockTables = [
        { 
          id: 1, 
          number: 'T001', 
          capacity: 4, 
          status: 'Active', 
          location: 'Indoor', 
          description: 'Bàn gần cử a sổ', 
          createdAt: '2024-01-15',
          hasQRCode: true
        },
        { 
          id: 2, 
          number: 'T002', 
          capacity: 2, 
          status: 'Active', 
          location: 'Indoor', 
          description: '', 
          createdAt: '2024-01-16',
          hasQRCode: true
        },
        { 
          id: 3, 
          number: 'T003', 
          capacity: 6, 
          status: 'Inactive', 
          location: 'Outdoor', 
          description: 'Bàn ngoài hiên', 
          createdAt: '2024-01-17',
          hasQRCode: false
        },
        { 
          id: 4, 
          number: 'T004', 
          capacity: 8, 
          status: 'Active', 
          location: 'Patio', 
          description: 'Bàn lớn cho nhóm', 
          createdAt: '2024-01-18',
          hasQRCode: true
        },
        { 
          id: 5, 
          number: 'T005', 
          capacity: 4, 
          status: 'Active', 
          location: 'VIP Room', 
          description: '', 
          createdAt: '2024-01-19',
          hasQRCode: true
        },
        { 
          id: 6, 
          number: 'T006', 
          capacity: 2, 
          status: 'Active', 
          location: 'VIP Room', 
          description: 'Bàn VIP nhỏ', 
          createdAt: '2024-01-20',
          hasQRCode: false
        },
        { 
          id: 7, 
          number: 'T007', 
          capacity: 10, 
          status: 'Inactive', 
          location: 'Outdoor', 
          description: 'Bàn lớn ngoài trời', 
          createdAt: '2024-01-21',
          hasQRCode: false
        },
      ];
      setTables(mockTables);
    } catch (err) {
      setError(err);
    }
  }, []);

  const handleCreateTable = (tableData) => {
    const newTable = {
      id: tables.length + 1,
      ...tableData,
      status: 'Active',
      hasQRCode: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTables([...tables, newTable]);
    setShowCreateModal(false);
  };

  const handleEditTable = (tableData) => {
    setTables(tables.map(table => 
      table.id === editingTable.id 
        ? { ...table, ...tableData }
        : table
    ));
    setShowEditModal(false);
    setEditingTable(null);
  };

  const handleToggleTableStatus = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    const action = table.status === 'Active' ? 'tạm ngưng' : 'kích hoạt lại';
    const newStatus = table.status === 'Active' ? 'Inactive' : 'Active';
    
    if (window.confirm(`Bạn có chắc chắn muốn ${action} bàn ${table.number}?`)) {
      setTables(tables.map(t => 
        t.id === tableId 
          ? { ...t, status: newStatus }
          : t
      ));
    }
  };

  const openEditModal = (table) => {
    setEditingTable(table);
    setShowEditModal(true);
  };

  const openQRModal = (table) => {
    setQrTable(table);
    setShowQRModal(true);
  };

  // Filter and Sort functions
  const getFilteredAndSortedTables = () => {
    let filteredTables = tables.filter(table => {
      // Status filter
      if (filters.status && table.status !== filters.status) return false;
      
      // Location filter  
      if (filters.location && table.location !== filters.location) return false;
      
      return true;
    });

    // Sort tables
    filteredTables.sort((a, b) => {
      let aValue = a[sortConfig.field];
      let bValue = b[sortConfig.field];
      
      // Special handling for different field types
      if (sortConfig.field === 'number') {
        // Extract numeric part for table numbers like T001, T002
        aValue = parseInt(aValue.replace(/\D/g, '')) || 0;
        bValue = parseInt(bValue.replace(/\D/g, '')) || 0;
      } else if (sortConfig.field === 'capacity') {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      } else if (sortConfig.field === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredTables;
  };

  const resetFiltersAndSort = () => {
    setFilters({
      status: '',
      location: ''
    });
    setSortConfig({
      field: 'number',
      direction: 'asc'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { class: 'status-active', text: 'Kích hoạt' },
      Inactive: { class: 'status-inactive', text: 'Tạm ngưng' }
    };
    
    const config = statusConfig[status] || statusConfig.Active;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const filteredAndSortedTables = getFilteredAndSortedTables();

  return (
    <div className="table-management">
      <div className="table-management-header">
        <h1 className="page-title">
          <FaUsers className="title-icon" />
          Quản Lý Bàn Ăn
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus className="btn-icon" />
          Thêm Bàn Mới
        </button>
        <button 
          className={`btn ${showFilterPanel ? 'btn-warning' : 'btn-secondary'}`}
          onClick={() => setShowFilterPanel(!showFilterPanel)}
        >
          <FaFilter className="btn-icon" />
          Lọc & Sắp xếp
        </button>
      </div>

      <div className="table-stats">
        <div className="stat-card">
          <h3>Tổng số bàn</h3>
          <p className="stat-number">{tables.length}</p>
        </div>
        <div className="stat-card">
          <h3>Đang hiển thị</h3>
          <p className="stat-number">{filteredAndSortedTables.length}</p>
        </div>
        <div className="stat-card">
          <h3>Bàn kích hoạt</h3>
          <p className="stat-number active">
            {tables.filter(t => t.status === 'Active').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Bàn tạm ngưng</h3>
          <p className="stat-number inactive">
            {tables.filter(t => t.status === 'Inactive').length}
          </p>
        </div>
      </div>

      {showFilterPanel && (
        <FilterSortPanel
          filters={filters}
          setFilters={setFilters}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          onReset={resetFiltersAndSort}
        />
      )}

      <div className="table-list">
        <table className="table">
          <thead>
            <tr>
              <th>Mã Bàn</th>
              <th>Sức Chứa</th>
              <th>Khu Vực</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTables.map(table => (
              <tr key={table.id} className={table.status === 'Inactive' ? 'table-row-inactive' : ''}>
                <td className="table-number">{table.number}</td>
                <td>
                  <FaUsers className="capacity-icon" />
                  {table.capacity} người
                </td>
                <td>{table.location}</td>
                <td>{getStatusBadge(table.status)}</td>
                <td>{new Date(table.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => openQRModal(table)}
                      title="Xem QR Code"
                    >
                      <FaQrcode />
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => openEditModal(table)}
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn btn-sm ${
                        table.status === 'Active' ? 'btn-secondary' : 'btn-primary'
                      }`}
                      onClick={() => handleToggleTableStatus(table.id)}
                      title={table.status === 'Active' ? 'Tạm ngưng' : 'Kích hoạt lại'}
                    >
                      {table.status === 'Active' ? 'Tạm ngưng' : 'Kích hoạt'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateTableModal
          onSave={handleCreateTable}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && editingTable && (
        <EditTableModal
          table={editingTable}
          onSave={handleEditTable}
          onClose={() => {
            setShowEditModal(false);
            setEditingTable(null);
          }}
        />
      )}
      {showQRModal && qrTable && (
        <QRCodeModal
          table={qrTable}
          onClose={() => {
            setShowQRModal(false);
            setQrTable(null);
          }}
        />
      )}
    </div>
  );
};

export default TableManagement;