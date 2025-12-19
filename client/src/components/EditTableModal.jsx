import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit } from 'react-icons/fa';

const EditTableModal = ({ table, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    location: '',
    status: 'Active',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeactivateWarning, setShowDeactivateWarning] = useState(false);
  const [hasActiveOrders, setHasActiveOrders] = useState(false);

  useEffect(() => {
    if (table) {
      // Check if table has active orders (mock check)
      const activeOrdersExist = Math.random() > 0.7; // Random for demo
      setHasActiveOrders(activeOrdersExist);
      
      setFormData({
        number: table.number,
        capacity: table.capacity.toString(),
        location: table.location,
        status: table.status === 'active' ? 'Active' : table.status === 'inactive' ? 'Inactive' : table.status || 'Active',
        description: table.description || ''
      });
    }
  }, [table]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate table number
    if (!formData.number.trim()) {
      newErrors.number = 'Mã bàn là bắt buộc';
    } else if (formData.number.length < 2) {
      newErrors.number = 'Mã bàn phải có ít nhất 2 ký tự';
    }

    // Validate capacity
    if (!formData.capacity) {
      newErrors.capacity = 'Số lượng ghế là bắt buộc';
    } else {
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity <= 0) {
        newErrors.capacity = 'Số lượng ghế phải là số nguyên dương lớn hơn 0';
      } else if (capacity < 1 || capacity > 20) {
        newErrors.capacity = 'Số lượng ghế phải từ 1 đến 20';
      }
    }

    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = 'Khu vực là bắt buộc';
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = 'Trạng thái là bắt buộc';
    }

    // Description is optional, just check length
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if deactivating table with active orders
    if (table.status === 'Active' && formData.status === 'Inactive' && hasActiveOrders) {
      setShowDeactivateWarning(true);
      return;
    }
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tableData = {
        number: formData.number.trim(),
        capacity: parseInt(formData.capacity),
        location: formData.location.trim(),
        status: formData.status,
        description: formData.description.trim()
      };

      onSave(tableData);
    } catch (error) {
      console.error('Error updating table:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeactivate = () => {
    setShowDeactivateWarning(false);
    // Proceed with the update
    const tableData = {
      number: formData.number.trim(),
      capacity: parseInt(formData.capacity),
      location: formData.location.trim(),
      status: formData.status,
      description: formData.description.trim()
    };
    onSave(tableData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusOptions = () => [
    { value: 'Active', label: 'Kích hoạt', color: '#28a745' },
    { value: 'Inactive', label: 'Tạm ngưng', color: '#dc3545' }
  ];

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            <FaEdit className="modal-icon" />
            Chỉnh Sửa Bàn {table?.number}
          </h2>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="number" className="form-label">
              Mã Bàn *
            </label>
            <input
              type="text"
              id="number"
              name="number"
              className={`form-control ${errors.number ? 'is-invalid' : ''}`}
              value={formData.number}
              onChange={handleInputChange}
              placeholder="Nhập mã bàn (VD: T001, B01, ...)"
              disabled={isSubmitting}
            />
            {errors.number && (
              <div className="invalid-feedback">{errors.number}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="capacity" className="form-label">
              Số Lượng Ghế *
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="Nhập số lượng ghế"
              min="1"
              max="20"
              disabled={isSubmitting}
            />
            {errors.capacity && (
              <div className="invalid-feedback">{errors.capacity}</div>
            )}
            <small className="form-text text-muted">
              Số lượng ghế phải từ 1 đến 20
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Khu Vực *
            </label>
            <select
              id="location"
              name="location"
              className={`form-control ${errors.location ? 'is-invalid' : ''}`}
              value={formData.location}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="">Chọn khu vực</option>
              <option value="Indoor">Indoor - Trong nhà</option>
              <option value="Outdoor">Outdoor - Ngoài trời</option>
              <option value="Patio">Patio - Sân hiên</option>
              <option value="VIP Room">VIP Room - Phòng VIP</option>
            </select>
            {errors.location && (
              <div className="invalid-feedback">{errors.location}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Trạng Thái *
            </label>
            <select
              id="status"
              name="status"
              className={`form-control ${errors.status ? 'is-invalid' : ''}`}
              value={formData.status}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              {getStatusOptions().map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <div className="invalid-feedback">{errors.status}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Mô Tả (Tùy chọn)
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả về bàn (vị trí cụ thể, đặc điểm...)"
              rows="3"
              maxLength="500"
              disabled={isSubmitting}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
            <small className="form-text text-muted">
              Tối đa 500 ký tự. Còn lại: {500 - formData.description.length}
            </small>
          </div>

          <div className="status-preview">
            <span className="form-label">Xem trước trạng thái:</span>
            <span 
              className={`status-badge status-${formData.status}`}
              style={{ 
                marginLeft: '10px',
                backgroundColor: getStatusOptions().find(opt => opt.value === formData.status)?.color + '20',
                color: getStatusOptions().find(opt => opt.value === formData.status)?.color
              }}
            >
              {getStatusOptions().find(opt => opt.value === formData.status)?.label || 'Trống'}
            </span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật'}
            </button>
          </div>
        </form>
      </div>
      
      {showDeactivateWarning && (
        <div className="warning-overlay">
          <div className="warning-modal">
            <div className="warning-header">
              <h3>⚠️ Cảnh báo</h3>
            </div>
            <div className="warning-content">
              <p>Bàn này hiện có đơn hàng đang hoạt động!</p>
              <p>Việc tạm ngưng bàn sẽ:</p>
              <ul>
                <li>Ngăn không cho đặt hàng mới</li>
                <li>Giữ nguyên lịch sử đơn hàng hiện tại</li>
                <li>Khách hàng hiện tại vẫn có thể tiếp tục sử dụng</li>
              </ul>
              <p><strong>Bạn có chắc chắn muốn tiếp tục?</strong></p>
            </div>
            <div className="warning-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeactivateWarning(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={handleConfirmDeactivate}
              >
                Xác nhận tạm ngưng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTableModal;