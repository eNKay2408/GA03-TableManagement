import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaTimes, FaQrcode, FaCopy, FaDownload } from 'react-icons/fa';

const QRCodeModal = ({ table, onClose }) => {
  if (!table) return null;

  // URL giả định cho QR code - trong thực tế sẽ là URL thật của bàn
  const qrCodeValue = `https://restaurant.com/table/${table.number}?id=${table.id}`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(qrCodeValue).then(() => {
      alert('Đã copy URL vào clipboard!');
    }).catch(err => {
      console.error('Lỗi khi copy:', err);
    });
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('.qr-code-canvas svg');
    if (svg) {
      // Convert SVG to canvas to download as PNG
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
      };
      
      img.src = url;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
              <span className={`status-badge status-${table.status}`}>
                {table.status === 'available' ? 'Trống' : 
                 table.status === 'occupied' ? 'Có khách' : 'Đã đặt'}
              </span>
            </div>
          </div>

          <div className="qr-code-container">
            <div className="qr-code-canvas">
              <QRCodeSVG
                value={qrCodeValue}
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
                  value={qrCodeValue}
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
          </div>

          <div className="qr-actions">
            <button
              className="btn btn-primary"
              onClick={handleDownloadQR}
            >
              <FaDownload className="btn-icon" />
              Tải QR Code
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
    </div>
  );
};

export default QRCodeModal;