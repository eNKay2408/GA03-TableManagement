import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes, FaCheck, FaSync, FaTrash, FaQrcode } from 'react-icons/fa';
import './ConfirmModal.css';

/**
 * Custom Confirm Modal Component
 * Thay thế window.confirm() và window.prompt() với UI đẹp hơn
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'warning', // 'warning', 'danger', 'info', 'success'
    icon = null,
    requireInput = false, // For double confirmation
    inputPlaceholder = 'Nhập để xác nhận...',
    inputValidation = null, // Expected input value
    bullets = [], // Array of warning points
    loading = false
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isValid, setIsValid] = useState(!requireInput);

    useEffect(() => {
        if (requireInput && inputValidation) {
            setIsValid(inputValue === inputValidation);
        }
    }, [inputValue, requireInput, inputValidation]);

    useEffect(() => {
        // Reset input when modal opens
        if (isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    useEffect(() => {
        // Handle Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getTypeConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    iconClass: 'danger',
                    IconComponent: icon || FaTrash,
                    confirmClass: 'btn-danger'
                };
            case 'warning':
                return {
                    iconClass: 'warning',
                    IconComponent: icon || FaExclamationTriangle,
                    confirmClass: 'btn-warning'
                };
            case 'success':
                return {
                    iconClass: 'success',
                    IconComponent: icon || FaCheck,
                    confirmClass: 'btn-success'
                };
            case 'info':
            default:
                return {
                    iconClass: 'info',
                    IconComponent: icon || FaQrcode,
                    confirmClass: 'btn-primary'
                };
        }
    };

    const typeConfig = getTypeConfig();
    const IconComponent = typeConfig.IconComponent;

    const handleConfirm = () => {
        if (isValid && !loading) {
            onConfirm();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div className="confirm-modal-overlay" onClick={handleBackdropClick}>
            <div className="confirm-modal">
                {/* Header with icon */}
                <div className={`confirm-modal-header ${typeConfig.iconClass}`}>
                    <div className="confirm-icon-wrapper">
                        <IconComponent className="confirm-icon" />
                    </div>
                    <button
                        className="confirm-close-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="confirm-modal-content">
                    <h3 className="confirm-title">{title}</h3>
                    <p className="confirm-message">{message}</p>

                    {/* Warning bullets */}
                    {bullets.length > 0 && (
                        <ul className="confirm-bullets">
                            {bullets.map((bullet, index) => (
                                <li key={index} className="confirm-bullet-item">
                                    <FaExclamationTriangle className="bullet-icon" />
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Input for double confirmation */}
                    {requireInput && (
                        <div className="confirm-input-section">
                            <label className="confirm-input-label">
                                Nhập "<strong>{inputValidation}</strong>" để xác nhận:
                            </label>
                            <input
                                type="text"
                                className="confirm-input"
                                placeholder={inputPlaceholder}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                autoFocus
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="confirm-modal-actions">
                    <button
                        className="btn btn-secondary confirm-cancel-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${typeConfig.confirmClass} confirm-btn`}
                        onClick={handleConfirm}
                        disabled={!isValid || loading}
                    >
                        {loading ? (
                            <>
                                <FaSync className="spin" /> Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FaCheck /> {confirmText}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
