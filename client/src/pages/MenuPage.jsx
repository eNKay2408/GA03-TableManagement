import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaUtensils, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import './MenuPage.css';

const MenuPage = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tableData, setTableData] = useState(null);
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            verifyAndFetchTable();
        } else {
            setError('Không tìm thấy mã QR. Vui lòng quét lại mã QR trên bàn.');
            setLoading(false);
        }
    }, [token]);

    const verifyAndFetchTable = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/verify?token=${token}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Mã QR không hợp lệ');
            }

            setTableData(data.data);
        } catch (err) {
            console.error('Error verifying QR code:', err);
            setError(err.message || 'Không thể xác thực mã QR. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="menu-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <h2>Đang xác thực mã QR...</h2>
                    <p>Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="menu-page">
                <div className="error-container">
                    <FaTimesCircle className="error-icon" />
                    <h2>Có lỗi xảy ra</h2>
                    <p>{error}</p>
                    <button
                        className="retry-btn"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!tableData) {
        return (
            <div className="menu-page">
                <div className="error-container">
                    <FaTimesCircle className="error-icon" />
                    <h2>Không tìm thấy thông tin bàn</h2>
                    <p>Vui lòng quét lại mã QR</p>
                </div>
            </div>
        );
    }

    return (
        <div className="menu-page">
            <div className="menu-container">
                {/* Header */}
                <div className="menu-header">
                    <div className="restaurant-info">
                        <h1 className="restaurant-name">🍽️ Nhà Hàng Smart Restaurant</h1>
                        <p className="welcome-text">Chào mừng quý khách!</p>
                    </div>
                </div>

                {/* Table Info Card */}
                <div className="table-info-card">
                    <div className="card-header">
                        <FaCheckCircle className="success-icon" />
                        <h2>Thông tin bàn của bạn</h2>
                    </div>

                    <div className="table-details">
                        <div className="detail-row">
                            <div className="detail-icon">
                                <FaUtensils />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Số bàn</span>
                                <span className="detail-value">{tableData.table.table_number}</span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-icon">
                                <FaUsers />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Sức chứa</span>
                                <span className="detail-value">{tableData.table.capacity} người</span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-icon">
                                <FaMapMarkerAlt />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Khu vực</span>
                                <span className="detail-value">{tableData.table.location}</span>
                            </div>
                        </div>

                        {tableData.table.description && (
                            <div className="detail-row">
                                <div className="detail-icon">
                                    ℹ️
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Mô tả</span>
                                    <span className="detail-value">{tableData.table.description}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu Section */}
                <div className="menu-section">
                    <h2 className="section-title">📋 Thực đơn</h2>
                    <div className="menu-notice">
                        <p>🎉 Chức năng xem menu và đặt món đang được phát triển!</p>
                        <p>Vui lòng gọi nhân viên để được hỗ trợ đặt món.</p>
                    </div>
                </div>

                {/* Call Staff Button */}
                <div className="menu-action-buttons">
                    <button className="call-staff-btn">
                        🔔 Gọi nhân viên
                    </button>
                    <button className="view-menu-btn">
                        📖 Xem thực đơn đầy đủ
                    </button>
                </div>

                {/* Footer */}
                <div className="menu-footer">
                    <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                    <p className="footer-note">Mã QR hợp lệ trong 30 ngày</p>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;
