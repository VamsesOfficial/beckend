import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, DollarSign, Users, AlertCircle, FileText, Menu, X, Download, Upload } from 'lucide-react';

const getInitialData = () => ({
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
});

export default function RTRWNetAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [paymentForm, setPaymentForm] = useState({ month: '', method: 'cash' });
  const [filterMonth, setFilterMonth] = useState('2025-01');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading && customers.length > 0) {
      saveData();
    }
  }, [customers, payments, settings]);

  const loadData = async () => {
    try {
      const [customersData, paymentsData, settingsData, adminData] = await Promise.all([
        window.storage.get('rtrw_customers'),
        window.storage.get('rtrw_payments'),
        window.storage.get('rtrw_settings'),
        window.storage.get('rtrw_admin')
      ]);

      const initialData = getInitialData();
      
      setCustomers(customersData ? JSON.parse(customersData.value) : initialData.customers);
      setPayments(paymentsData ? JSON.parse(paymentsData.value) : initialData.payments);
      setSettings(settingsData ? JSON.parse(settingsData.value) : initialData.settings);
      setAdmin(adminData ? JSON.parse(adminData.value) : initialData.admin);
    } catch (error) {
      console.log('Loading initial data...', error);
      const initialData = getInitialData();
      setCustomers(initialData.customers);
      setPayments(initialData.payments);
      setSettings(initialData.settings);
      setAdmin(initialData.admin);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async () => {
    try {
      setSaveStatus('Menyimpan...');
      await Promise.all([
        window.storage.set('rtrw_customers', JSON.stringify(customers)),
        window.storage.set('rtrw_payments', JSON.stringify(payments)),
        window.storage.set('rtrw_settings', JSON.stringify(settings)),
        window.storage.set('rtrw_admin', JSON.stringify(admin))
      ]);
      setSaveStatus(' Tersimpan');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus(' Gagal');
    }
  };

  const exportData = () => {
    const data = {
      customers,
      payments,
      settings,
      admin,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rtrw-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.customers && data.payments && data.settings) {
          setCustomers(data.customers);
          setPayments(data.payments);
          setSettings(data.settings);
          if (data.admin) setAdmin(data.admin);
          alert('Data berhasil diimport!');
        } else {
          alert('Format file tidak valid!');
        }
      } catch (error) {
        alert('Gagal membaca file!');
      }
    };
    reader.readAsText(file);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === admin.username && loginForm.password === admin.password) {
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    } else {
      alert('Username atau password salah!');
    }
  };

  const currentMonth = '2025-01';
  const paidThisMonth = payments.filter(p => p.month === currentMonth).length;
  const totalIncome = payments.filter(p => p.month === currentMonth).reduce((sum, p) => sum + p.amount, 0);
  const unpaidCustomers = customers.filter(c => c.lastPayment !== currentMonth);

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
      admin: admin.name
    };
    
    setPayments([...payments, newPayment]);
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id ? { ...c, lastPayment: paymentForm.month } : c
    ));
    
    alert('Pembayaran berhasil dicatat!');
    setSelectedCustomer(null);
    setPaymentForm({ month: '', method: 'cash' });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const overdueCustomers = customers.filter(c => {
    if (!c.lastPayment) return true;
    const [year, month] = currentMonth.split('-');
    const [lastYear, lastMonth] = c.lastPayment.split('-');
    return lastYear < year || (lastYear === year && lastMonth < month);
  });

  const Navigation = () => (
    <div className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold">{settings?.businessName}</h1>
            {saveStatus && (
              <span className="text-xs bg-blue-500 px-2 py-1 rounded">{saveStatus}</span>
            )}
          </div>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2">
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav className={`${showMobileMenu ? 'block' : 'hidden'} md:flex absolute md:relative top-14 md:top-0 left-0 right-0 bg-blue-600 md:bg-transparent z-50 shadow-lg md:shadow-none`}>
            <ul className="flex flex-col md:flex-row gap-0 md:gap-4 p-4 md:p-0">
              {['Dashboard', 'Pelanggan', 'Pembayaran', 'Laporan', 'Tunggakan', 'Pengaturan'].map(page => (
                <li key={page}>
                  <button 
                    onClick={() => { setCurrentPage(page.toLowerCase()); setShowMobileMenu(false); }} 
                    className="hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-200 w-full text-left md:w-auto px-3 py-2 md:p-0 rounded transition-colors"
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li>
                <button 
                  onClick={() => { setIsLoggedIn(false); setCurrentPage('login'); setShowMobileMenu(false); }} 
                  className="hover:bg-red-700 md:hover:bg-transparent text-red-200 w-full text-left md:w-auto px-3 py-2 md:p-0 rounded transition-colors"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
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
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
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
      
      <div className="container mx-auto px-4 py-4 md:py-6">
        {currentPage === 'dashboard' && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Total Pelanggan</p>
                    <p className="text-2xl md:text-3xl font-bold">{customers.length}</p>
                  </div>
                  <Users className="text-blue-500" size={32} />
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Sudah Bayar</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">{paidThisMonth}</p>
                  </div>
                  <DollarSign className="text-green-500" size={32} />
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Belum Bayar</p>
                    <p className="text-2xl md:text-3xl font-bold text-red-600">{unpaidCustomers.length}</p>
                  </div>
                  <AlertCircle className="text-red-500" size={32} />
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow col-span-2 lg:col-span-1">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Pemasukan Bulan Ini</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-600">Rp {totalIncome.toLocaleString('id-ID')}</p>
                  </div>
                  <FileText className="text-blue-500" size={32} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold mb-4">Pelanggan Belum Bayar Bulan Ini</h3>
              {unpaidCustomers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Semua pelanggan sudah bayar!</p>
              ) : (
                <div className="space-y-2">
                  {unpaidCustomers.map(c => (
                    <div key={c.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-red-50 rounded gap-2">
                      <div className="flex-1">
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

        {currentPage === 'pelanggan' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Data Pelanggan</h2>
              <button
                onClick={() => { setEditingCustomer({}); setCurrentPage('tambah-pelanggan'); }}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 whitespace-nowrap">Nama</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 whitespace-nowrap">No HP</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 whitespace-nowrap hidden md:table-cell">Alamat</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 whitespace-nowrap">Paket</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 whitespace-nowrap">Harga</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 whitespace-nowrap hidden lg:table-cell">Status</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap">{customer.name}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{customer.phone}</td>
                      <td className="px-3 py-3 hidden md:table-cell max-w-xs truncate">{customer.address}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{customer.package}</td>
                      <td className="px-3 py-3 whitespace-nowrap">Rp {customer.price.toLocaleString('id-ID')}</td>
                      <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                        <span className={`px-2 py-1 rounded text-xs ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {customer.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
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

        {currentPage === 'tambah-pelanggan' && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{editingCustomer?.id ? 'Edit' : 'Tambah'} Pelanggan</h2>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 max-w-2xl">
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
                    {settings?.packages.map((pkg, idx) => (
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
                <div className="flex flex-col md:flex-row gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex-1 md:flex-none">
                    Simpan
                  </button>
                  <button type="button" onClick={() => { setCurrentPage('pelanggan'); setEditingCustomer(null); }} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 flex-1 md:flex-none">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {currentPage === 'pembayaran' && (
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
                        className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                            <p className="text-sm text-gray-500">{customer.package}</p>
                          </div>
                          <div className="text-left md:text-right">
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
                  
                  <div className="flex flex-col md:flex-row gap-2 pt-4">
                    <button
                      onClick={handlePayment}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium flex-1 md:flex-none"
                    >
                      Bayar
                    </button>
                    <button
                      onClick={() => { setSelectedCustomer(null); setPaymentForm({ month: '', method: 'cash' }); }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 flex-1 md:flex-none"
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
                      <th className="px-3 py-3 text-left font-medium text-gray-700 hidden lg:table-cell">Metode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(-10).reverse().map(payment => (
                      <tr key={payment.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-3">{payment.customerName}</td>
                        <td className="px-3 py-3">{payment.month}</td>
                        <td className="px-3 py-3 hidden md:table-cell">{payment.date}</td>
                        <td className="px-3 py-3 whitespace-nowrap">Rp {payment.amount.toLocaleString('id-ID')}</td>
                        <td className="px-3 py-3 hidden lg:table-cell">
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

        {currentPage === 'laporan' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Laporan</h2>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => alert('Fitur export akan segera hadir!')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 flex-1 md:flex-none justify-center">
                  <Download size={18} /> Export
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Filter Bulan:</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500 text-sm mb-2">Total Pemasukan</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  Rp {payments.filter(p => p.month === filterMonth).reduce((sum, p) => sum + p.amount, 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500 text-sm mb-2">Pelanggan Aktif</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">{customers.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500 text-sm mb-2">Jumlah Tunggakan</p>
                <p className="text-2xl md:text-3xl font-bold text-red-600">{overdueCustomers.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold mb-4">Detail Pembayaran - {filterMonth}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left font-medium text-gray-700">Tanggal</th>
                      <th className="px-3 py-3 text-left font-medium text-gray-700">Nama</th>
                      <th className="px-3 py-3 text-left font-medium text-gray-700">Nominal</th>
                      <th className="px-3 py-3 text-left font-medium text-gray-700 hidden md:table-cell">Metode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.filter(p => p.month === filterMonth).map(payment => (
                      <tr key={payment.id} className="border-t">
                        <td className="px-3 py-3">{payment.date}</td>
                        <td className="px-3 py-3">{payment.customerName}</td>
                        <td className="px-3 py-3 whitespace-nowrap">Rp {payment.amount.toLocaleString('id-ID')}</td>
                        <td className="px-3 py-3 capitalize hidden md:table-cell">{payment.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'tunggakan' && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Daftar Tunggakan</h2>
            
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
                        <th className="px-3 py-3 text-left font-medium text-gray-700 hidden md:table-cell">Paket</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700">Tunggakan</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700 hidden lg:table-cell">Bayar Terakhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueCustomers.map(customer => {
                        const monthsOverdue = customer.lastPayment ? 
                          (parseInt(currentMonth.split('-')[1]) - parseInt(customer.lastPayment.split('-')[1])) : 1;
                        return (
                          <tr key={customer.id} className="border-t hover:bg-gray-50">
                            <td className="px-3 py-3 font-medium">{customer.name}</td>
                            <td className="px-3 py-3">{customer.phone}</td>
                            <td className="px-3 py-3 hidden md:table-cell">{customer.package}</td>
                            <td className="px-3 py-3">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-medium text-xs">
                                {monthsOverdue} bulan
                              </span>
                            </td>
                            <td className="px-3 py-3 hidden lg:table-cell">{customer.lastPayment || 'Belum pernah'}</td>
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

        {currentPage === 'pengaturan' && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Pengaturan</h2>
            
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Backup & Restore Data</h3>
              <div className="flex flex-col md:flex-row gap-2">
                <button onClick={exportData} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center">
                  <Download size={18} /> Export Data (JSON)
                </button>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center cursor-pointer">
                  <Upload size={18} /> Import Data (JSON)
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">Data tersimpan otomatis. Export untuk backup manual.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Data Usaha</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Usaha</label>
                  <input
                    type="text"
                    value={settings?.businessName}
                    onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <input
                    type="text"
                    value={settings?.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor HP</label>
                  <input
                    type="text"
                    value={settings?.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Paket Internet</h3>
              <div className="space-y-3">
                {settings?.packages.map((pkg, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{pkg.name}</span>
                    <span className="text-blue-600 font-bold">Rp {pkg.price.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h3 className="text-lg font-bold mb-4">Akun Admin</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Username:</span> <span className="font-medium">{admin?.username}</span></p>
                <p><span className="text-gray-600">Nama:</span> <span className="font-medium">{admin?.name}</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}