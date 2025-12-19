import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaTimes, FaQrcode, FaCopy, FaDownload, FaFilePdf, FaSync, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { tableAPI } from '../api/tableAPI';
import ConfirmModal from './ConfirmModal';

const QRCodeModal = ({ table, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  useEffect(() => {
    if (table && table.id) {
      fetchQRCode();
    }
  }, [table]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch QR code from backend
      const response = await tableAPI.getQRImage(table.id, 'base64');

      if (response.success && response.data) {
        setQrData(response.data);
      } else {
        setError('Không tìm thấy QR Code cho bàn này');
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setError('Lỗi khi tải QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (qrData && qrData.qr_url) {
      navigator.clipboard.writeText(qrData.qr_url).then(() => {
        toast.success('Đã copy URL vào clipboard!', {
          duration: 2000,
          position: 'top-right',
        });
      }).catch(err => {
        console.error('Lỗi khi copy:', err);
        toast.error('Không thể copy URL', {
          duration: 2000,
          position: 'top-right',
        });
      });
    }
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('.qr-code-canvas svg');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = new XMLSerializer().serializeToString(svg);
      const DOMURL = window.URL || window.webkitURL || window;

      const img = new Image();
      const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const url = DOMURL.createObjectURL(svgBlob);

      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);

        const imgURI = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `QR_${table.number}.png`;
        link.href = imgURI;
        link.click();

        toast.success('Đã tải QR Code!', {
          duration: 2000,
          position: 'top-right',
        });
      };

      img.src = url;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Đang tạo PDF...', { id: 'pdf-download' });

      const blob = await tableAPI.downloadQRPDF(table.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${table.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Đã tải PDF thành công!', {
        id: 'pdf-download',
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Lỗi khi tải PDF', {
        id: 'pdf-download',
        duration: 2000,
        position: 'top-right',
      });
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 🔄 Regenerate QR Code
  const handleRegenerateQR = () => {
    setShowRegenerateConfirm(true);
  };

  const confirmRegenerateQR = async () => {
    setShowRegenerateConfirm(false);
    try {
      setRegenerating(true);
      toast.loading('Đang tạo mới QR Code...', { id: 'regenerate-qr' });

      const response = await tableAPI.regenerateQR(table.id);

      if (response.success) {
        // Fetch lại QR code mới
        await fetchQRCode();
        toast.success('Đã tạo mới QR Code thành công!', {
          id: 'regenerate-qr',
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error regenerating QR:', error);
      toast.error(`Lỗi: ${error.message}`, {
        id: 'regenerate-qr',
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setRegenerating(false);
    }
  };

  // 🖨️ Print Preview
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const svg = document.querySelector('.qr-code-canvas svg');

    if (!svg || !printWindow) {
      toast.error('Không thể mở cửa sổ in');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - Bàn ${table.number}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .container {
            text-align: center;
            max-width: 400px;
          }
          .restaurant-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
          }
          .table-number {
            font-size: 36px;
            font-weight: bold;
            color: #e74c3c;
            margin: 20px 0;
          }
          .table-info {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 20px;
          }
          .qr-code {
            margin: 30px 0;
          }
          .qr-code svg {
            width: 250px;
            height: 250px;
          }
          .instruction {
            font-size: 18px;
            font-weight: bold;
            color: #e74c3c;
            margin-top: 20px;
          }
          .sub-instruction {
            font-size: 12px;
            color: #95a5a6;
            margin-top: 10px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="restaurant-name">🍽️ Smart Restaurant</div>
          <div class="table-number">Bàn ${table.number}</div>
          <div class="table-info">${table.capacity} người • ${table.location}</div>
          <div class="qr-code">${svgData}</div>
          <div class="instruction">📱 Quét mã để đặt món</div>
          <div class="sub-instruction">Scan QR code bằng camera điện thoại</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!table) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content qr-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <FaQrcode className="modal-icon" />
            QR Code - Bàn {table.number}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="qr-modal-body">
          <div className="table-info">
            <div className="info-row">
              <span className="info-label">Mã bàn:</span>
              <span className="info-value">{table.number}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Sức chứa:</span>
              <span className="info-value">{table.capacity} người</span>
            </div>
            <div className="info-row">
              <span className="info-label">Khu vực:</span>
              <span className="info-value">{table.location}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Trạng thái:</span>
              <span className={`status-badge status-${table.status?.toLowerCase()}`}>
                {table.status === 'Active' ? 'Kích hoạt' : 'Tạm ngưng'}
              </span>
            </div>
          </div>

          <div className="qr-code-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>⏳ Đang tải QR Code...</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
                <div>❌ {error}</div>
                <button
                  className="btn btn-primary"
                  onClick={fetchQRCode}
                  style={{ marginTop: '10px' }}
                >
                  Thử lại
                </button>
              </div>
            ) : qrData && qrData.qr_url ? (
              <>
                <div className="qr-code-canvas">
                  <QRCodeSVG
                    value={qrData.qr_url}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>

                <div className="qr-url">
                  <span className="url-label">URL:</span>
                  <div className="url-container">
                    <input
                      type="text"
                      value={qrData.qr_url}
                      readOnly
                      className="url-input"
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleCopyToClipboard}
                      title="Copy URL"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>⚠️ Bàn này chưa có QR Code</div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  QR Code sẽ được tạo tự động khi bàn được tạo
                </div>
              </div>
            )}
          </div>

          <div className="qr-actions">
            <button
              className="btn btn-primary"
              onClick={handleDownloadQR}
              disabled={loading || error || !qrData}
            >
              <FaDownload /> Tải PNG
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleDownloadPDF}
              disabled={loading || error || !qrData}
            >
              <FaFilePdf /> Tải PDF
            </button>
            <button
              className="btn btn-info"
              onClick={handlePrint}
              disabled={loading || error || !qrData}
              title="In QR Code"
            >
              <FaPrint /> In
            </button>
            <button
              className="btn btn-warning"
              onClick={handleRegenerateQR}
              disabled={loading || regenerating}
              title="Tạo mới QR Code (QR cũ sẽ không hoạt động)"
            >
              <FaSync className={regenerating ? 'spin' : ''} /> Tạo mới
            </button>
            <button
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Custom Confirm Modal for Regenerate QR */}
      <ConfirmModal
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={confirmRegenerateQR}
        title="Tạo mới QR Code"
        message={`Bạn có chắc chắn muốn tạo mới QR Code cho bàn ${table?.number}?`}
        type="warning"
        icon={FaSync}
        confirmText="Tạo mới"
        cancelText="Hủy"
        bullets={[
          'QR Code cũ sẽ KHÔNG CÒN HOẠT ĐỘNG',
          'Khách hàng sẽ cần quét QR mới',
          'Hành động này không thể hoàn tác'
        ]}
      />
    </div>
  );
};

export default QRCodeModal;