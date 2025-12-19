import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TableManagement from './components/TableManagement';
import MenuPage from './pages/MenuPage';
import './App.css';

function App() {
  try {
    return (
      <BrowserRouter>
        <Routes>
          {/* Customer Menu Page - QR Code destination */}
          <Route path="/menu" element={<MenuPage />} />

          {/* Admin Dashboard */}
          <Route path="/" element={
            <div className="App">
              <header className="App-header">
                <div className="container">
                  <h1 className="app-title">
                    🍽️ Restaurant Management System
                  </h1>
                  <p className="app-subtitle">
                    Hệ thống quản lý nhà hàng - Admin Dashboard
                  </p>
                </div>
              </header>

              <main className="App-main">
                <TableManagement />
              </main>

              <footer className="App-footer">
                <div className="container">
                  <p>&copy; 2024 Restaurant Management System. All rights reserved.</p>
                </div>
              </footer>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Error Loading App</h1>
        <p>Error: {error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
}

export default App;
