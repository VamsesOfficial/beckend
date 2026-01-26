import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, DollarSign, Users, AlertCircle, FileText, Menu, X, Download, Upload, LogOut, Home, CreditCard, FileBarChart, Clock, Settings } from 'lucide-react';

// ==================== UTILITY FUNCTIONS ====================
const API_URL = 'https://your-backend.vercel.app/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  auth: {
    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },

  customers: {
    getAll: () => api.request('/customers'),
    getById: (id) => api.request(`/customers/${id}`),
    create: (data) => api.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => api.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => api.request(`/customers/${id}`, {
      method: 'DELETE',
    }),
  },

  payments: {
    getAll: (params) => api.request(`/payments${params ? `?${new URLSearchParams(params)}` : ''}`),
    create: (data) => api.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getByCustomer: (customerId) => api.request(`/payments/customer/${customerId}`),
  },

  reports: {
    monthly: (year, month) => api.request(`/reports/monthly/${year}/${month}`),
    yearly: (year) => api.request(`/reports/yearly/${year}`),
    customer: (customerId) => api.request(`/reports/customer/${customerId}`),
    exportPDF: (type, params) => api.request(`/reports/export/pdf?type=${type}&${new URLSearchParams(params)}`),
    exportExcel: (type, params) => api.request(`/reports/export/excel?type=${type}&${new URLSearchParams(params)}`),
  },
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

// ==================== COMPONENTS ====================

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`}>
      {message}
    </div>
  );
};

const LoadingSpinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
};

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================

export default function RTRWNetAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [paymentForm, setPaymentForm] = useState({ month: '', method: 'cash' });
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, paymentsData] = await Promise.all([
        api.customers.getAll(),
        api.payments.getAll(),
      ]);
      setCustomers(customersData);
      setPayments(paymentsData);
    } catch (error) {
      showToast('Gagal memuat data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.auth.login(loginForm);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsLoggedIn(true);
      setCurrentUser(response.user);
      setCurrentPage('dashboard');
      showToast('Login berhasil!', 'success');
      await loadData();
    } catch (error) {
      showToast('Login gagal: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('login');
    showToast('Logout berhasil', 'success');
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      setLoading(true);
      if (customerData.id) {
        await api.customers.update(customerData.id, customerData);
        showToast('Pelanggan berhasil diupdate', 'success');
      } else {
        await api.customers.create(customerData);
        showToast('Pelanggan berhasil ditambahkan', 'success');
      }
      await loadData();
      setCurrentPage('pelanggan');
      setEditingCustomer(null);
    } catch (error) {
      showToast('Gagal menyimpan: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = (customer) => {
    setConfirmDialog({
      title: 'Hapus Pelanggan',
      message: `Yakin ingin menghapus pelanggan ${customer.name}? Semua riwayat pembayaran akan ikut terhapus.`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await api.customers.delete(customer.id);
          showToast('Pelanggan berhasil dihapus', 'success');
          await loadData();
        } catch (error) {
          showToast('Gagal menghapus: ' + error.message, 'error');
        } finally {
          setLoading(false);
          setConfirmDialog(null);
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handlePayment = async () => {
    if (!paymentForm.month) {
      showToast('Pilih bulan pembayaran!', 'warning');
      return;
    }

    try {
      setLoading(true);
      await api.payments.create({
        customerId: selectedCustomer.id,
        month: paymentForm.month,
        method: paymentForm.method,
        amount: selectedCustomer.price,
      });
      showToast('Pembayaran berhasil dicatat!', 'success');
      setSelectedCustomer(null);
      setPaymentForm({ month: '', method: 'cash' });
      await loadData();
    } catch (error) {
      showToast('Gagal mencatat pembayaran: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const currentMonth = new Date().toISOString().slice(0, 7);
  const paidThisMonth = payments.filter(p => p.month === currentMonth).length;
  const totalIncome = payments
    .filter(p => p.month === currentMonth)
    .reduce((sum, p) => sum + p.amount, 0);
  const unpaidCustomers = customers.filter(c => c.lastPayment !== currentMonth);

  const Navigation = () => (
    <div className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold">RT/RW Net Admin</h1>
          </div>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2">
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav className={`${showMobileMenu ? 'block' : 'hidden'} md:flex absolute md:relative top-14 md:top-0 left-0 right-0 bg-blue-600 md:bg-transparent z-50 shadow-lg md:shadow-none`}>
            <ul className="flex flex-col md:flex-row gap-0 md:gap-4 p-4 md:p-0">
              <NavItem icon={Home} label="Dashboard" page="dashboard" />
              <NavItem icon={Users} label="Pelanggan" page="pelanggan" />
              <NavItem icon={CreditCard} label="Pembayaran" page="pembayaran" />
              <NavItem icon={FileBarChart} label="Laporan" page="laporan" />
              <NavItem icon={Clock} label="Tunggakan" page="tunggakan" />
              <NavItem icon={Settings} label="Pengaturan" page="pengaturan" />
              <li>
                <button 
                  onClick={handleLogout} 
                  className="hover:bg-red-700 md:hover:bg-transparent text-red-200 w-full text-left md:w-auto px-3 py-2 md:p-0 rounded transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );

  const NavItem = ({ icon: Icon, label, page }) => (
    <li>
      <button 
        onClick={() => { setCurrentPage(page); setShowMobileMenu(false); }} 
        className={`hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-200 w-full text-left md:w-auto px-3 py-2 md:p-0 rounded transition-colors flex items-center gap-2 ${currentPage === page ? 'bg-blue-700 md:bg-transparent md:text-blue-200' : ''}`}
      >
        <Icon size={18} /> {label}
      </button>
    </li>
  );

  if (loading && !isLoggedIn) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-600 mb-6">RT/RW Net Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan password"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-4">Gunakan kredensial yang telah diberikan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-4 md:py-6">
        {loading && <LoadingSpinner />}
        
        {currentPage === 'dashboard' && !loading && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <StatCard
                icon={Users}
                label="Total Pelanggan"
                value={customers.length}
                color="blue"
              />
              <StatCard
                icon={DollarSign}
                label="Sudah Bayar"
                value={paidThisMonth}
                color="green"
              />
              <StatCard
                icon={AlertCircle}
                label="Belum Bayar"
                value={unpaidCustomers.length}
                color="red"
              />
              <StatCard
                icon={FileText}
                label="Pemasukan Bulan Ini"
                value={formatCurrency(totalIncome)}
                color="blue"
                isLarge
              />
            </div>
            
            <UnpaidCustomersList customers={unpaidCustomers} />
          </div>
        )}

        {currentPage === 'pelanggan' && !loading && (
          <CustomerList
            customers={filteredCustomers}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEdit={(customer) => {
              setEditingCustomer(customer);
              setCurrentPage('tambah-pelanggan');
            }}
            onDelete={handleDeleteCustomer}
            onAdd={() => {
              setEditingCustomer({});
              setCurrentPage('tambah-pelanggan');
            }}
          />
        )}

        {currentPage === 'tambah-pelanggan' && !loading && (
          <CustomerForm
            customer={editingCustomer}
            onSave={handleSaveCustomer}
            onCancel={() => {
              setCurrentPage('pelanggan');
              setEditingCustomer(null);
            }}
          />
        )}

        {currentPage === 'pembayaran' && !loading && (
          <PaymentPage
            customers={filteredCustomers}
            payments={payments}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
            paymentForm={paymentForm}
            onPaymentFormChange={setPaymentForm}
            onPayment={handlePayment}
          />
        )}

        {currentPage === 'laporan' && !loading && (
          <ReportPage
            payments={payments}
            customers={customers}
            filterMonth={filterMonth}
            onFilterChange={setFilterMonth}
            onExport={(type) => showToast(`Export ${type} akan segera tersedia`, 'info')}
          />
        )}

        {currentPage === 'tunggakan' && !loading && (
          <OverduePage customers={customers} currentMonth={currentMonth} />
        )}

        {currentPage === 'pengaturan' && !loading && (
          <SettingsPage currentUser={currentUser} />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog {...confirmDialog} />
      )}
    </div>
  );
}

// ==================== PAGE COMPONENTS ====================

const StatCard = ({ icon: Icon, label, value, color, isLarge }) => {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
  };

  return (
    <div className={`bg-white p-4 md:p-6 rounded-lg shadow ${isLarge ? 'col-span-2 lg:col-span-1' : ''}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <p className="text-gray-500 text-xs md:text-sm">{label}</p>
          <p className={`text-${isLarge ? 'xl md:text-2xl' : '2xl md:text-3xl'} font-bold ${color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
            {value}
          </p>
        </div>
        <Icon className={colorClasses[color]} size={32} />
      </div>
    </div>
  );
};

const UnpaidCustomersList = ({ customers }) => (
  <div className="bg-white rounded-lg shadow p-4 md:p-6">
    <h3 className="text-base md:text-lg font-bold mb-4">Pelanggan Belum Bayar Bulan Ini</h3>
    {customers.length === 0 ? (
      <p className="text-gray-500 text-center py-8">Semua pelanggan sudah bayar!</p>
    ) : (
      <div className="space-y-2">
        {customers.map(c => (
          <div key={c.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-red-50 rounded gap-2">
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-600">{c.phone}</p>
            </div>
            <span className="text-red-600 font-bold">{formatCurrency(c.price)}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const CustomerList = ({ customers, searchTerm, onSearchChange, onEdit, onDelete, onAdd }) => (
  <div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold">Data Pelanggan</h2>
      <button
        onClick={onAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 w-full md:w-auto justify-center"
      >
        <Plus size={20} /> Tambah Pelanggan
      </button>
    </div>
    
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center gap-2">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cari nama atau nomor HP..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left font-medium text-gray-700">Nama</th>
            <th className="px-3 py-3 text-left font-medium text-gray-700">No HP</th>
            <th className="px-3 py-3 text-left font-medium text-gray-700 hidden md:table-cell">Alamat</th>
            <th className="px-3 py-3 text-left font-medium text-gray-700">Paket</th>
            <th className="px-3 py-3 text-left font-medium text-gray-700">Harga</th>
            <th className="px-3 py-3 text-left font-medium text-gray-700">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-3">{customer.name}</td>
              <td className="px-3 py-3">{customer.phone}</td>
              <td className="px-3 py-3 hidden md:table-cell max-w-xs truncate">{customer.address}</td>
              <td className="px-3 py-3">{customer.package}</td>
              <td className="px-3 py-3">{formatCurrency(customer.price)}</td>
              <td className="px-3 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(customer)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(customer)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CustomerForm = ({ customer, onSave, onCancel }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSave({
      id: customer?.id,
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      package: formData.get('package'),
      price: parseInt(formData.get('price')),
      dueDate: parseInt(formData.get('dueDate')),
    });
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
        {customer?.id ? 'Edit' : 'Tambah'} Pelanggan
      </h2>
      <div className="bg-white rounded-lg shadow p-4 md:p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Pelanggan *</label>
            <input
              name="name"
              defaultValue={customer?.name}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nomor HP *</label>
            <input
              name="phone"
              defaultValue={customer?.phone}
              required
              pattern="[0-9]{10,13}"
              title="Nomor HP harus 10-13 digit"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alamat *</label>
            <textarea
              name="address"
              defaultValue={customer?.address}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Paket Internet *</label>
            <select
              name="package"
              defaultValue={customer?.package}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Paket A - 20 Mbps">Paket A - 20 Mbps</option>
              <option value="Paket B - 30 Mbps">Paket B - 30 Mbps</option>
              <option value="Paket C - 50 Mbps">Paket C - 50 Mbps</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Harga per Bulan (Rp) *</label>
            <input
              name="price"
              type="number"
              min="0"
              defaultValue={customer?.price}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Jatuh Tempo *</label>
            <input
              name="dueDate"
              type="number"
              min="1"
              max="31"
              defaultValue={customer?.dueDate || 10}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentPage = ({ customers, payments, searchTerm, onSearchChange, selectedCustomer, onSelectCustomer, paymentForm, onPaymentFormChange, onPayment }) => (
  <div>
    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Pembayaran</h2>
    
    {!selectedCustomer ? (
      <>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center gap-2">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama atau nomor HP pelanggan..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-medium">Pilih Pelanggan</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {customers.map(customer => (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer)}
                className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-500">{customer.package}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{formatCurrency(customer.price)}</p>
                    <p className="text-xs text-gray-500">Bayar terakhir: {customer.lastPayment || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    ) : (
      <div className="bg-white rounded-lg shadow p-4 md:p-6 max-w-2xl">
        <h3 className="text-lg font-bold mb-4">Detail Pembayaran</h3>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Nama:</span>
            <span className="font-medium">{selectedCustomer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Paket:</span>
            <span className="font-medium">{selectedCustomer.package}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Harga:</span>
            <span className="font-medium text-blue-600">{formatCurrency(selectedCustomer.price)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bulan Dibayar *</label>
            <input
              type="month"
              value={paymentForm.month}
              onChange={(e) => onPaymentFormChange({ ...paymentForm, month: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Metode Pembayaran *</label>
            <select
              value={paymentForm.method}
              onChange={(e) => onPaymentFormChange({ ...paymentForm, method: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={onPayment}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Bayar
            </button>
            <button
              onClick={() => onSelectCustomer(null)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4">Riwayat Pembayaran Terbaru</h3>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-700">Nama</th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">Bulan</th>
              <th className="px-3 py-3 text-left font-medium text-gray-700 hidden md:table-cell">Tanggal</th>
              <th className="px-3 py-3 text-left font-medium text-gray-700">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {payments.slice(-10).reverse().map(payment => (
              <tr key={payment.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-3">{payment.customerName}</td>
                <td className="px-3 py-3">{payment.month}</td>
                <td className="px-3 py-3 hidden md:table-cell">{formatDate(payment.date)}</td>
                <td className="px-3 py-3">{formatCurrency(payment.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ReportPage = ({ payments, customers, filterMonth, onFilterChange, onExport }) => {
  const filteredPayments = payments.filter(p => p.month === filterMonth);
  const totalIncome = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const activeCustomers = customers.filter(c => c.status === 'active').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Laporan</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onExport('pdf')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Download size={18} /> PDF
          </button>
          <button
            onClick={() => onExport('excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={18} /> Excel
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Filter Bulan:</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Total Pemasukan</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Pelanggan Aktif</p>
          <p className="text-3xl font-bold text-blue-600">{activeCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Transaksi</p>
          <p className="text-3xl font-bold text-purple-600">{filteredPayments.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Detail Pembayaran - {filterMonth}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Tanggal</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Nama</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Nominal</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Metode</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="border-t">
                  <td className="px-3 py-3">{formatDate(payment.date)}</td>
                  <td className="px-3 py-3">{payment.customerName}</td>
                  <td className="px-3 py-3">{formatCurrency(payment.amount)}</td>
                  <td className="px-3 py-3 capitalize">{payment.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OverduePage = ({ customers, currentMonth }) => {
  const overdueCustomers = customers.filter(c => {
    if (!c.lastPayment) return true;
    return c.lastPayment < currentMonth;
  });

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6">Daftar Tunggakan</h2>
      
      {overdueCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">Tidak ada tunggakan! Semua pelanggan sudah bayar</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-red-50">
            <p className="text-red-600 font-medium">
              Ada {overdueCustomers.length} pelanggan yang belum bayar
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Nama</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">No HP</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Paket</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Bayar Terakhir</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {overdueCustomers.map(customer => (
                  <tr key={customer.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium">{customer.name}</td>
                    <td className="px-3 py-3">{customer.phone}</td>
                    <td className="px-3 py-3">{customer.package}</td>
                    <td className="px-3 py-3">{customer.lastPayment || 'Belum pernah'}</td>
                    <td className="px-3 py-3 text-red-600 font-bold">{formatCurrency(customer.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPage = ({ currentUser }) => (
  <div>
    <h2 className="text-xl md:text-2xl font-bold mb-6">Pengaturan</h2>
    
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Informasi Akun</h3>
      <div className="space-y-2">
        <p><span className="text-gray-600">Username:</span> <span className="font-medium">{currentUser?.username}</span></p>
        <p><span className="text-gray-600">Nama:</span> <span className="font-medium">{currentUser?.name}</span></p>
        <p><span className="text-gray-600">Role:</span> <span className="font-medium capitalize">{currentUser?.role}</span></p>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Tentang Aplikasi</h3>
      <p className="text-gray-600 mb-2">RT/RW Net Admin System v2.0</p>
      <p className="text-sm text-gray-500">Sistem manajemen pelanggan dan pembayaran untuk RT/RW Net</p>
    </div>
  </div>
)