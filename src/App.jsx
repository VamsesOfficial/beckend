import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, DollarSign, Users, AlertCircle, FileText, Settings, Menu, X, Download, Printer } from 'lucide-react';

// Data dummy untuk demo
const initialData = {
  admin: { username: 'admin', password: 'admin123', name: 'Pak Budi' },
  customers: [
    { id: 1, name: 'Ahmad Subagyo', phone: '08123456789', address: 'Jl. Mawar No. 12', package: 'Paket A - 20 Mbps', price: 150000, dueDate: 10, status: 'active', lastPayment: '2025-01' },
    { id: 2, name: 'Siti Nurhaliza', phone: '08234567890', address: 'Jl. Melati No. 5', package: 'Paket B - 30 Mbps', price: 200000, dueDate: 15, status: 'active', lastPayment: '2024-12' },
    { id: 3, name: 'Budi Santoso', phone: '08345678901', address: 'Jl. Kenanga No. 8', package: 'Paket A - 20 Mbps', price: 150000, dueDate: 10, status: 'active', lastPayment: '2025-01' },
    { id: 4, name: 'Dewi Lestari', phone: '08456789012', address: 'Jl. Anggrek No. 3', package: 'Paket C - 50 Mbps', price: 300000, dueDate: 20, status: 'active', lastPayment: '2024-11' },
  ],
  payments: [
    { id: 1, customerId: 1, customerName: 'Ahmad Subagyo', month: '2025-01', amount: 150000, date: '2025-01-10', method: 'cash', admin: 'Pak Budi' },
    { id: 2, customerId: 3, customerName: 'Budi Santoso', month: '2025-01', amount: 150000, date: '2025-01-12', method: 'transfer', admin: 'Pak Budi' },
  ],
  settings: {
    businessName: 'RT/RW Net Makmur',
    address: 'RT 05 / RW 03, Kelurahan Sukamaju',
    phone: '08123456789',
    packages: [
      { name: 'Paket A - 20 Mbps', price: 150000 },
      { name: 'Paket B - 30 Mbps', price: 200000 },
      { name: 'Paket C - 50 Mbps', price: 300000 },
    ]
  }
};

export default function RTRWNetAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [customers, setCustomers] = useState(initialData.customers);
  const [payments, setPayments] = useState(initialData.payments);
  const [settings, setSettings] = useState(initialData.settings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [paymentForm, setPaymentForm] = useState({ month: '', method: 'cash' });
  const [filterMonth, setFilterMonth] = useState('2025-01');

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === initialData.admin.username && loginForm.password === initialData.admin.password) {
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    } else {
      alert('Username atau password salah!');
    }
  };

  // Calculate statistics
  const currentMonth = '2025-01';
  const paidThisMonth = payments.filter(p => p.month === currentMonth).length;
  const totalIncome = payments.filter(p => p.month === currentMonth).reduce((sum, p) => sum + p.amount, 0);
  const unpaidCustomers = customers.filter(c => c.lastPayment !== currentMonth);

  // Customer operations
  const handleSaveCustomer = (customer) => {
    if (customer.id) {
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    } else {
      setCustomers([...customers, { ...customer, id: Date.now(), status: 'active', lastPayment: '' }]);
    }
    setCurrentPage('pelanggan');
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id) => {
    if (confirm('Yakin ingin menghapus pelanggan ini?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  // Payment operations
  const handlePayment = () => {
    if (!paymentForm.month) {
      alert('Pilih bulan pembayaran!');
      return;
    }
    
    const newPayment = {
      id: Date.now(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      month: paymentForm.month,
      amount: selectedCustomer.price,
      date: new Date().toISOString().split('T')[0],
      method: paymentForm.method,
      admin: initialData.admin.name
    };
    
    setPayments([...payments, newPayment]);
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id ? { ...c, lastPayment: paymentForm.month } : c
    ));
    
    alert('Pembayaran berhasil dicatat!');
    setSelectedCustomer(null);
    setPaymentForm({ month: '', method: 'cash' });
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  // Get overdue customers
  const overdueCustomers = customers.filter(c => {
    if (!c.lastPayment) return true;
    const [year, month] = currentMonth.split('-');
    const [lastYear, lastMonth] = c.lastPayment.split('-');
    return lastYear < year || (lastYear === year && lastMonth < month);
  });

  // Navigation component
  const Navigation = () => (
    <div className="bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">{settings.businessName}</h1>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden">
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav className={`${showMobileMenu ? 'block' : 'hidden'} md:block absolute md:relative top-16 md:top-0 left-0 right-0 bg-blue-600 md:bg-transparent z-50`}>
            <ul className="flex flex-col md:flex-row gap-2 md:gap-4 p-4 md:p-0">
              <li><button onClick={() => { setCurrentPage('dashboard'); setShowMobileMenu(false); }} className="hover:text-blue-200 w-full text-left md:w-auto">Dashboard</button></li>
              <li><button onClick={() => { setCurrentPage('pelanggan'); setShowMobileMenu(false); }} className="hover:text-blue-200 w-full text-left md:w-auto">Pelanggan</button></li>
              <li><button onClick={() => { setCurrentPage('pembayaran'); setShowMobileMenu(false); }} className="hover:text-blue-200 w-full text-left md:w-auto">Pembayaran</button></li>
              <li><button onClick={() => { setCurrentPage('laporan'); setShowMobileMenu(false); }} className="hover:text-blue-200 w-full text-left md:w-auto">Laporan</button></li>
              <li><button onClick={() => { setCurrentPage('tunggakan'); setShowMobileMenu(false); }} className="hover:text-blue-200 w-full text-left md:w-auto">Tunggakan</button></li>
              <li><button onClick={() => { setCurrentPage('pengaturan'); setShowMobileMenu(false); }} className="hover:text-blue-200 w-full text-left md:w-auto">Pengaturan</button></li>
              <li><button onClick={() => { setIsLoggedIn(false); setCurrentPage('login'); setShowMobileMenu(false); }} className="hover:text-blue-200 text-red-200 w-full text-left md:w-auto">Logout</button></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">RT/RW Net Admin</h1>
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
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
              Login
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-4">Demo: admin / admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Dashboard */}
        {currentPage === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Pelanggan</p>
                    <p className="text-3xl font-bold">{customers.length}</p>
                  </div>
                  <Users className="text-blue-500" size={40} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Sudah Bayar</p>
                    <p className="text-3xl font-bold text-green-600">{paidThisMonth}</p>
                  </div>
                  <DollarSign className="text-green-500" size={40} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Belum Bayar</p>
                    <p className="text-3xl font-bold text-red-600">{unpaidCustomers.length}</p>
                  </div>
                  <AlertCircle className="text-red-500" size={40} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pemasukan Bulan Ini</p>
                    <p className="text-2xl font-bold text-blue-600">Rp {totalIncome.toLocaleString('id-ID')}</p>
                  </div>
                  <FileText className="text-blue-500" size={40} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Pelanggan Belum Bayar Bulan Ini</h3>
              {unpaidCustomers.length === 0 ? (
                <p className="text-gray-500">Semua pelanggan sudah bayar! 🎉</p>
              ) : (
                <div className="space-y-2">
                  {unpaidCustomers.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-gray-600">{c.phone}</p>
                      </div>
                      <span className="text-red-600 font-bold">Rp {c.price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Pelanggan */}
        {currentPage === 'pelanggan' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Data Pelanggan</h2>
              <button
                onClick={() => { setEditingCustomer({}); setCurrentPage('tambah-pelanggan'); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} /> Tambah Pelanggan
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center gap-2">
                <Search className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau nomor HP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">No HP</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Alamat</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Paket</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Harga</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{customer.name}</td>
                      <td className="px-4 py-3">{customer.phone}</td>
                      <td className="px-4 py-3">{customer.address}</td>
                      <td className="px-4 py-3">{customer.package}</td>
                      <td className="px-4 py-3">Rp {customer.price.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {customer.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingCustomer(customer); setCurrentPage('tambah-pelanggan'); }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
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
        )}

        {/* Form Tambah/Edit Pelanggan */}
        {currentPage === 'tambah-pelanggan' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{editingCustomer?.id ? 'Edit' : 'Tambah'} Pelanggan</h2>
            <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSaveCustomer({
                  id: editingCustomer?.id,
                  name: formData.get('name'),
                  phone: formData.get('phone'),
                  address: formData.get('address'),
                  package: formData.get('package'),
                  price: parseInt(formData.get('price')),
                  dueDate: parseInt(formData.get('dueDate')),
                  status: editingCustomer?.status || 'active',
                  lastPayment: editingCustomer?.lastPayment || ''
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Pelanggan *</label>
                  <input name="name" defaultValue={editingCustomer?.name} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor HP *</label>
                  <input name="phone" defaultValue={editingCustomer?.phone} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat *</label>
                  <textarea name="address" defaultValue={editingCustomer?.address} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paket Internet *</label>
                  <select name="package" defaultValue={editingCustomer?.package} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {settings.packages.map((pkg, idx) => (
                      <option key={idx} value={pkg.name}>{pkg.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harga per Bulan (Rp) *</label>
                  <input name="price" type="number" defaultValue={editingCustomer?.price} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Jatuh Tempo *</label>
                  <input name="dueDate" type="number" min="1" max="31" defaultValue={editingCustomer?.dueDate || 10} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Simpan
                  </button>
                  <button type="button" onClick={() => { setCurrentPage('pelanggan'); setEditingCustomer(null); }} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pembayaran */}
        {currentPage === 'pembayaran' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pembayaran</h2>
            
            {!selectedCustomer ? (
              <>
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau nomor HP pelanggan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Pilih Pelanggan</h3>
                  </div>
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-4 hover:bg-blue-50 cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                            <p className="text-sm text-gray-500">{customer.package}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">Rp {customer.price.toLocaleString('id-ID')}</p>
                            <p className="text-xs text-gray-500">Bayar terakhir: {customer.lastPayment || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
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
                    <span className="font-medium text-blue-600">Rp {selectedCustomer.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bayar Terakhir:</span>
                    <span className="font-medium">{selectedCustomer.lastPayment || 'Belum ada'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bulan Dibayar *</label>
                    <input
                      type="month"
                      value={paymentForm.month}
                      onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Metode Pembayaran *</label>
                    <select
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handlePayment}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Bayar
                    </button>
                    <button
                      onClick={() => { setSelectedCustomer(null); setPaymentForm({ month: '', method: 'cash' }); }}
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
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bulan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nominal</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Metode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(-10).reverse().map(payment => (
                      <tr key={payment.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{payment.customerName}</td>
                        <td className="px-4 py-3">{payment.month}</td>
                        <td className="px-4 py-3">{payment.date}</td>
                        <td className="px-4 py-3">Rp {payment.amount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3">
                          <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {payment.method}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Laporan */}
        {currentPage === 'laporan' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Laporan</h2>
              <div className="flex gap-2">
                <button onClick={() => alert('Fitur export PDF/Excel akan segera hadir!')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Download size={18} /> Export
                </button>
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Printer size={18} /> Print
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Filter Bulan:</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500 text-sm mb-2">Total Pemasukan</p>
                <p className="text-3xl font-bold text-green-600">
                  Rp {payments.filter(p => p.month === filterMonth).reduce((sum, p) => sum + p.amount, 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500 text-sm mb-2">Pelanggan Aktif</p>
                <p className="text-3xl font-bold text-blue-600">{customers.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500 text-sm mb-2">Jumlah Tunggakan</p>
                <p className="text-3xl font-bold text-red-600">{overdueCustomers.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Detail Pembayaran - {filterMonth}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama Pelanggan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nominal</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Metode</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.filter(p => p.month === filterMonth).map(payment => (
                      <tr key={payment.id} className="border-t">
                        <td className="px-4 py-3">{payment.date}</td>
                        <td className="px-4 py-3">{payment.customerName}</td>
                        <td className="px-4 py-3">Rp {payment.amount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 capitalize">{payment.method}</td>
                        <td className="px-4 py-3">{payment.admin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tunggakan */}
        {currentPage === 'tunggakan' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Daftar Tunggakan</h2>
            
            {overdueCustomers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg">Tidak ada tunggakan! Semua pelanggan sudah bayar 🎉</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b bg-red-50">
                  <p className="text-red-600 font-medium">
                    Ada {overdueCustomers.length} pelanggan yang belum bayar
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">No HP</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Paket</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tunggakan</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bayar Terakhir</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueCustomers.map(customer => {
                        const monthsOverdue = customer.lastPayment ? 
                          (parseInt(currentMonth.split('-')[1]) - parseInt(customer.lastPayment.split('-')[1])) : 1;
                        return (
                          <tr key={customer.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{customer.name}</td>
                            <td className="px-4 py-3">{customer.phone}</td>
                            <td className="px-4 py-3">{customer.package}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-medium">
                                {monthsOverdue} bulan
                              </span>
                            </td>
                            <td className="px-4 py-3">{customer.lastPayment || 'Belum pernah'}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => alert(`Kirim reminder ke ${customer.name} (${customer.phone})\n\nFitur WhatsApp/SMS akan segera hadir!`)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                              >
                                Kirim Reminder
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pengaturan */}
        {currentPage === 'pengaturan' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pengaturan</h2>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Data Usaha</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Usaha</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor HP</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Simpan
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Paket Internet</h3>
              <div className="space-y-3">
                {settings.packages.map((pkg, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{pkg.name}</span>
                    <span className="text-blue-600 font-bold">Rp {pkg.price.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Akun Admin</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Username:</span> <span className="font-medium">{initialData.admin.username}</span></p>
                <p><span className="text-gray-600">Nama:</span> <span className="font-medium">{initialData.admin.name}</span></p>
                <button type="button" className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
                  Ganti Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}