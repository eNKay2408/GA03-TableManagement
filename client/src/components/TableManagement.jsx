import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaUsers, FaQrcode, FaFilter, FaDownload, FaFileArchive, FaSync, FaFilePdf } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import CreateTableModal from './CreateTableModal';
import EditTableModal from './EditTableModal';
import QRCodeModal from './QRCodeModal';
import ConfirmModal from './ConfirmModal';
import FilterSortPanel from './FilterSortPanel';
import { tableAPI, transformTableData } from '../api/tableAPI';
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
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Filter and Sort states
  const [filters, setFilters] = useState({
    status: '',
    location: ''
  });

  const [sortConfig, setSortConfig] = useState({
    field: 'number',
    direction: 'asc'
  });

  // Fetch tables from API
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tableAPI.getAllTables();

      if (response.success && response.data) {
        const transformedTables = response.data.map(transformTableData);
        setTables(transformedTables);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '20px', background: 'white', margin: '20px', borderRadius: '8px' }}>
        <h2>❌ Lỗi kết nối</h2>
        <p>Không thể kết nối đến server. Vui lòng kiểm tra:</p>
        <ul>
          <li>Server đang chạy tại http://localhost:5000</li>
          <li>CORS đã được cấu hình đúng</li>
          <li>Database đã kết nối</li>
        </ul>
        <p>Chi tiết lỗi: {error.message}</p>
        <button
          onClick={() => {
            setError(null);
            fetchTables();
          }}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px'
      }}>
        <div>
          <div style={{ marginBottom: '10px' }}>⏳ Đang tải dữ liệu...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Kết nối đến server...</div>
        </div>
      </div>
    );
  }

  const handleCreateTable = async (tableData) => {
    try {
      const response = await tableAPI.createTable(tableData);

      if (response.success) {
        // Refresh the table list
        await fetchTables();
        setShowCreateModal(false);
        toast.success('Tạo bàn thành công!', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error(`Lỗi: ${error.message}`, {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  const handleEditTable = async (tableData) => {
    try {
      const response = await tableAPI.updateTable(editingTable.id, tableData);

      if (response.success) {
        // Refresh the table list
        await fetchTables();
        setShowEditModal(false);
        setEditingTable(null);
        toast.success('Cập nhật bàn thành công!', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error(`Lỗi: ${error.message}`, {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  const handleToggleTableStatus = async (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const action = table.status === 'Active' ? 'tạm ngưng' : 'kích hoạt lại';
    const newStatus = table.status === 'Active' ? 'Inactive' : 'Active';

    if (window.confirm(`Bạn có chắc chắn muốn ${action} bàn ${table.number}?`)) {
      try {
        const response = await tableAPI.updateTableStatus(tableId, newStatus);

        if (response.success) {
          // Refresh the table list
          await fetchTables();
          toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} bàn thành công!`, {
            duration: 3000,
            position: 'top-right',
          });
        }
      } catch (error) {
        console.error('Error toggling table status:', error);
        toast.error(`Lỗi: ${error.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
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

  // ===== BULK ACTIONS =====

  // Download all QR codes as PDF
  const handleDownloadBulkPDF = async () => {
    try {
      setBulkLoading(true);
      toast.loading('Đang tạo PDF...', { id: 'bulk-pdf' });

      const blob = await tableAPI.downloadBulkQRPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Đã tải PDF thành công!', { id: 'bulk-pdf', duration: 3000 });
    } catch (error) {
      console.error('Error downloading bulk PDF:', error);
      toast.error('Lỗi khi tải PDF', { id: 'bulk-pdf', duration: 3000 });
    } finally {
      setBulkLoading(false);
    }
  };

  // Download all QR codes as ZIP
  const handleDownloadBulkZIP = async () => {
    try {
      setBulkLoading(true);
      toast.loading('Đang tạo ZIP...', { id: 'bulk-zip' });

      const blob = await tableAPI.downloadBulkQRZIP();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-qr-codes-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Đã tải ZIP thành công!', { id: 'bulk-zip', duration: 3000 });
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      toast.error('Lỗi khi tải ZIP', { id: 'bulk-zip', duration: 3000 });
    } finally {
      setBulkLoading(false);
    }
  };

  // Regenerate all QR codes
  const handleBulkRegenerateQR = () => {
    setShowBulkConfirm(true);
  };

  const confirmBulkRegenerateQR = async () => {
    setShowBulkConfirm(false);

    try {
      setBulkLoading(true);
      toast.loading('Đang tạo mới tất cả QR Code...', { id: 'bulk-regenerate' });

      const response = await tableAPI.bulkRegenerateQR();

      if (response.success) {
        await fetchTables();
        toast.success(
          `Hoàn thành! ${response.data.successful} bàn đã được cập nhật QR mới.`,
          { id: 'bulk-regenerate', duration: 5000 }
        );
      }
    } catch (error) {
      console.error('Error in bulk regenerate:', error);
      toast.error(`Lỗi: ${error.message}`, { id: 'bulk-regenerate', duration: 3000 });
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredAndSortedTables = getFilteredAndSortedTables();

  return (
    <div className="table-management">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            },
          },
        }}
      />
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

      {/* Bulk Actions Section */}
      <div className="bulk-actions">
        <h3>
          <FaQrcode /> Thao tác hàng loạt
        </h3>
        <div className="bulk-actions-buttons">
          <button
            className="btn"
            onClick={handleDownloadBulkPDF}
            disabled={bulkLoading || tables.length === 0}
          >
            <FaFilePdf /> Tải PDF tất cả
          </button>
          <button
            className="btn"
            onClick={handleDownloadBulkZIP}
            disabled={bulkLoading || tables.length === 0}
          >
            <FaFileArchive /> Tải ZIP (PNG)
          </button>
          <button
            className="btn btn-danger"
            onClick={handleBulkRegenerateQR}
            disabled={bulkLoading || tables.length === 0}
          >
            <FaSync className={bulkLoading ? 'spin' : ''} /> Tạo mới tất cả QR
          </button>
        </div>
      </div>

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
                      className={`btn btn-sm ${table.status === 'Active' ? 'btn-secondary' : 'btn-primary'
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

      {/* Custom Confirm Modal for Bulk Regenerate */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={confirmBulkRegenerateQR}
        title="Tạo mới tất cả QR Code"
        message={`Bạn sắp tạo mới QR Code cho ${tables.filter(t => t.status === 'Active').length} bàn!`}
        type="danger"
        icon={FaSync}
        confirmText="Tạo mới tất cả"
        cancelText="Hủy"
        requireInput={true}
        inputValidation="XÁC NHẬN"
        inputPlaceholder="Nhập XÁC NHẬN..."
        bullets={[
          'Tất cả QR Code cũ sẽ KHÔNG CÒN HOẠT ĐỘNG',
          'Khách hàng sẽ cần quét QR mới',
          'Hành động này KHÔNG THỂ HOÀN TÁC'
        ]}
        loading={bulkLoading}
      />
    </div>
  );
};

export default TableManagement;