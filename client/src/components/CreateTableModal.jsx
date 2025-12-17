import React, { useState } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

const CreateTableModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    location: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } else if (capacity > 20) {
        newErrors.capacity = 'Số lượng ghế không được vượt quá 20';
      }
    }

    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = 'Khu vực là bắt buộc';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        location: formData.location.trim()
      };

      onSave(tableData);
    } catch (error) {
      console.error('Error creating table:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            <FaPlus className="modal-icon" />
            Thêm Bàn Mới
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
              <option value="Khu A">Khu A - Tầng 1</option>
              <option value="Khu B">Khu B - Tầng 1</option>
              <option value="Khu C">Khu C - Tầng 2</option>
              <option value="Khu D">Khu D - Tầng 2</option>
              <option value="Khu VIP">Khu VIP - Tầng 3</option>
            </select>
            {errors.location && (
              <div className="invalid-feedback">{errors.location}</div>
            )}
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
              {isSubmitting ? 'Đang tạo...' : 'Tạo Bàn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTableModal;