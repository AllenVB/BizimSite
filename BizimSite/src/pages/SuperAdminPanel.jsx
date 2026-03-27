import React, { useState, useEffect } from "react";
import { Building2, Users, TrendingUp, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, LogOut, ChevronDown, ChevronUp, X, Check, AlertCircle, Loader2, Star, Zap, Crown, KeyRound, Search, MessageSquarePlus } from "lucide-react";
import { getSuperAdminDashboard, getTenants, createTenant, updateTenant, deleteTenant, getTenantUsers, getAllSuperAdminUsers, resetUserPassword, getFeedbacks, updateFeedbackStatus } from "../services/api";
import { useNavigate } from "react-router-dom";

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [expandedTenant, setExpandedTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [resetModal, setResetModal] = useState(null); // { user }
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", slug: "", address: "", phone: "", planType: "basic",
    adminName: "", adminEmail: "", adminPassword: ""
  });
  const [editData, setEditData] = useState({ planType: "basic", isActive: true, expiresAt: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, ten] = await Promise.all([getSuperAdminDashboard(), getTenants()]);
      setDashboard(dash.data);
      setTenants(ten.data);
    } catch (e) {
      setError("Veriler yüklenemedi: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTenant(formData);
      setShowForm(false);
      setFormData({ name: "", slug: "", address: "", phone: "", planType: "basic", adminName: "", adminEmail: "", adminPassword: "" });
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || "Bina oluşturulamadı!");
    }
  };

  const handleToggleActive = async (tenant) => {
    try {
      await updateTenant(tenant.id, { isActive: !tenant.isActive, planType: tenant.planType });
      loadData();
    } catch (e) {
      setError("Güncelleme hatası!");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateTenant(editTenant.id, editData);
      setEditTenant(null);
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || "Güncelleme hatası!");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(name + " adlı binayı silmek istediğinize emin misiniz? Tüm veriler kaybolacak!")) return;
    try {
      await deleteTenant(id);
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || "Silme hatası!");
    }
  };

  const handleExpandTenant = async (id) => {
    if (expandedTenant === id) { setExpandedTenant(null); setTenantUsers([]); return; }
    setExpandedTenant(id);
    try {
      const res = await getTenantUsers(id);
      setTenantUsers(res.data);
    } catch (e) {
      setTenantUsers([]);
    }
  };

  const loadAllUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await getAllSuperAdminUsers();
      setAllUsers(res.data);
    } catch (e) {
      setError("Kullanıcılar yüklenemedi");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    setFeedbacksLoading(true);
    try {
      const res = await getFeedbacks();
      setFeedbacks(res.data);
    } catch (e) {
      setError("Geri bildirimler yüklenemedi");
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const handleFeedbackStatus = async (id, status) => {
    try {
      await updateFeedbackStatus(id, { status });
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    } catch (e) {
      setError("Durum güncellenemedi");
    }
  };

  const handleTabChange = (key) => {
    setTab(key);
    if (key === "users" && allUsers.length === 0) loadAllUsers();
    if (key === "feedbacks" && feedbacks.length === 0) loadFeedbacks();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await resetUserPassword(resetModal.user.id, resetPassword);
      setResetModal(null);
      setResetPassword("");
    } catch (e) {
      setError(e.response?.data?.message || "Şifre sıfırlanamadı");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const planBadge = (plan) => {
    const colors = { basic: "bg-gray-100 text-gray-700", premium: "bg-blue-100 text-blue-700", enterprise: "bg-purple-100 text-purple-700" };
    return <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (colors[plan] || colors.basic)}>{plan}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Building2 size={28} />
          <div>
            <h1 className="text-xl font-bold">BizimSite SuperAdmin</h1>
            <p className="text-indigo-200 text-xs">Tüm binaları yönet</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 px-4 py-2 rounded-lg text-sm transition-all duration-150">
          <LogOut size={16} /> Çıkış
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="bg-white border-b px-6 flex gap-1">
        {[["dashboard", "Dashboard"], ["tenants", "Binalar"], ["users", "Kullanıcılar"], ["plans", "Planlar"], ["feedbacks", "Geri Bildirimler"]].map(([key, label]) => (
          <button key={key} onClick={() => handleTabChange(key)}
            className={"px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-1.5 " + (tab === key ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-800")}>
            {label}
            {key === "feedbacks" && feedbacks.filter(f => f.status === "new").length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {feedbacks.filter(f => f.status === "new").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        ) : tab === "feedbacks" ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Geri Bildirimler ({feedbacks.length})</h2>
              <button onClick={loadFeedbacks} className="text-xs text-indigo-600 hover:underline">Yenile</button>
            </div>
            {feedbacksLoading ? (
              <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-indigo-600" /></div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquarePlus size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Henüz geri bildirim yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedbacks.map(f => {
                  const typeColors = { general: 'bg-slate-100 text-slate-600', suggestion: 'bg-blue-100 text-blue-700', bug: 'bg-red-100 text-red-700', compliment: 'bg-green-100 text-green-700' };
                  const typeLabels = { general: 'Genel', suggestion: 'Öneri', bug: 'Hata', compliment: 'Teşekkür' };
                  const statusColors = { new: 'bg-orange-100 text-orange-700', read: 'bg-blue-50 text-blue-600', archived: 'bg-gray-100 text-gray-500' };
                  const statusLabels = { new: 'Yeni', read: 'Okundu', archived: 'Arşiv' };
                  return (
                    <div key={f.id} className={`bg-white rounded-xl border p-4 transition-all ${f.status === 'new' ? 'border-orange-200 shadow-sm' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[f.type] || typeColors.general}`}>
                              {typeLabels[f.type] || f.type}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[f.status] || statusColors.new}`}>
                              {statusLabels[f.status] || f.status}
                            </span>
                            {f.tenantName && (
                              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{f.tenantName}</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{f.title}</h3>
                          <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{f.message}</p>
                          <div className="mt-2 text-xs text-gray-400">
                            {f.senderName} · {f.senderRole} · {new Date(f.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          {f.status !== 'read' && (
                            <button onClick={() => handleFeedbackStatus(f.id, 'read')}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1.5 rounded-lg transition active:scale-95">
                              Okundu
                            </button>
                          )}
                          {f.status !== 'archived' && (
                            <button onClick={() => handleFeedbackStatus(f.id, 'archived')}
                              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition active:scale-95">
                              Arşivle
                            </button>
                          )}
                          {f.status === 'archived' && (
                            <button onClick={() => handleFeedbackStatus(f.id, 'new')}
                              className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium px-3 py-1.5 rounded-lg transition active:scale-95">
                              Geri Al
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : tab === "plans" ? (
          <PlansTab />
        ) : tab === "users" ? (
          <div>
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">Tüm Kullanıcılar ({allUsers.length})</h2>
              <div className="relative flex-1 max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pl-9 text-sm"
                  placeholder="İsim, e-posta, bina ara..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              <button onClick={loadAllUsers} className="btn-secondary text-sm whitespace-nowrap">Yenile</button>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-600" /></div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        <th className="text-left px-4 py-3">İsim</th>
                        <th className="text-left px-4 py-3">E-posta</th>
                        <th className="text-left px-4 py-3">Telefon</th>
                        <th className="text-left px-4 py-3">Bina</th>
                        <th className="text-left px-4 py-3">Blok / Daire</th>
                        <th className="text-left px-4 py-3">Rol</th>
                        <th className="text-left px-4 py-3">Aidat</th>
                        <th className="text-left px-4 py-3">Kayıt</th>
                        <th className="text-center px-4 py-3">Şifre</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {allUsers
                        .filter(u => {
                          const q = userSearch.toLowerCase();
                          return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.tenantName?.toLowerCase().includes(q);
                        })
                        .map(u => (
                          <tr key={u.id} className="hover:bg-indigo-50/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                                  {(u.name || u.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-800">{u.name || '—'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                            <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">{u.tenantName}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {u.block && u.block !== '-' ? `${u.block} Blok / ${u.no}` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                u.role === 'kapici' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{u.role}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {u.paid ? 'Ödedi' : 'Borçlu'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => { setResetModal({ user: u }); setResetPassword(""); }}
                                className="btn-icon hover:text-indigo-600 hover:bg-indigo-50"
                                title="Şifre Sıfırla"
                              >
                                <KeyRound size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {allUsers.length === 0 && (
                        <tr><td colSpan={9} className="px-4 py-16 text-center text-gray-400">
                          <Users size={36} className="mx-auto mb-3 opacity-30" />
                          <p>Kullanıcı bulunamadı.</p>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Şifre Sıfırla Modal */}
            {resetModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setResetModal(null)}>
                <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Şifre Sıfırla</h3>
                    <button onClick={() => setResetModal(null)} className="btn-icon"><X size={16} /></button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    <span className="font-semibold text-gray-700">{resetModal.user.name}</span> ({resetModal.user.email}) kullanıcısı için yeni şifre belirle.
                  </p>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Yeni Şifre</label>
                      <input
                        required
                        minLength={4}
                        type="text"
                        className="input-field"
                        placeholder="Yeni şifre girin"
                        value={resetPassword}
                        onChange={e => setResetPassword(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setResetModal(null)} className="btn-secondary">İptal</button>
                      <button type="submit" disabled={resetLoading} className="btn-primary bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200">
                        {resetLoading ? <Loader2 size={14} className="animate-spin" /> : <><KeyRound size={14} /> Sıfırla</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : tab === "dashboard" ? (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Genel Bakış</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Toplam Bina", value: dashboard?.totalTenants ?? 0, icon: Building2, color: "indigo" },
                { label: "Aktif Bina", value: dashboard?.activeTenants ?? 0, icon: Check, color: "green" },
                { label: "Toplam Kullanıcı", value: dashboard?.totalUsers ?? 0, icon: Users, color: "blue" },
                { label: "Toplam Gelir", value: (dashboard?.totalRevenue ?? 0).toLocaleString("tr-TR") + " ₺", icon: TrendingUp, color: "amber" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="stat-card group">
                  <div className={"inline-flex p-2 rounded-lg mb-3 bg-" + color + "-50 group-hover:scale-110 transition-transform duration-200"}>
                    <Icon size={20} className={"text-" + color + "-600"} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Binalar</h3>
              {tenants.slice(0, 8).map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium text-sm text-gray-700">{t.name}</span>
                  <div className="flex items-center gap-2">
                    {planBadge(t.planType)}
                    <span className={"text-xs " + (t.isActive ? "text-green-600" : "text-red-500")}>{t.isActive ? "Aktif" : "Pasif"}</span>
                  </div>
                </div>
              ))}
              {tenants.length === 0 && <p className="text-sm text-gray-400">Henüz bina yok.</p>}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Binalar ({tenants.length})</h2>
              <button onClick={() => setShowForm(!showForm)}
                className="btn-primary bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200">
                <Plus size={16} /> Yeni Bina
              </button>
            </div>

            {/* Create Form */}
            {showForm && (
              <div className="bg-white border border-indigo-100 rounded-xl shadow-sm p-6 mb-4">
                <h3 className="font-semibold text-gray-700 mb-4">Yeni Bina Ekle</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bina Adı *</label>
                    <input required className="input-field" placeholder="Güneş Apartmanı" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Slug (URL kısmı) *</label>
                    <input required className="input-field" placeholder="gunesapt" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s/g,"")})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Adres</label>
                    <input className="input-field" placeholder="İstanbul, Kadıköy..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Telefon</label>
                    <input className="input-field" placeholder="0212 000 00 00" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Plan</label>
                    <select className="input-field" value={formData.planType} onChange={e => setFormData({...formData, planType: e.target.value})}>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Adı *</label>
                    <input required className="input-field" placeholder="Ahmet Yılmaz" value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Admin E-posta *</label>
                    <input required type="email" className="input-field" placeholder="admin@gunesapt.com" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Şifre *</label>
                    <input required type="password" className="input-field" placeholder="••••••••" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
                    <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200">Oluştur</button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Modal */}
            {editTenant && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <h3 className="font-bold text-gray-800 mb-4">{editTenant.name} — Düzenle</h3>
                  <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Plan</label>
                      <select className="select-field" value={editData.planType} onChange={e => setEditData({...editData, planType: e.target.value})}>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Bitiş Tarihi (opsiyonel)</label>
                      <input type="date" className="input-field" value={editData.expiresAt} onChange={e => setEditData({...editData, expiresAt: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Durum:</span>
                      <button type="button" onClick={() => setEditData({...editData, isActive: !editData.isActive})} className={"flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition " + (editData.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                        {editData.isActive ? <><ToggleRight size={18} /> Aktif</> : <><ToggleLeft size={18} /> Pasif</>}
                      </button>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setEditTenant(null)} className="btn-secondary">İptal</button>
                      <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200">Kaydet</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Tenant List */}
            <div className="space-y-3">
              {tenants.length === 0 && !showForm && (
                <div className="text-center py-16 text-gray-400">
                  <Building2 size={24} className="mx-auto mb-3 opacity-30" />
                  <p>Henüz bina yok. Yeni bina ekleyin.</p>
                </div>
              )}
              {tenants.map(t => (
                <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">{t.name}</span>
                        {planBadge(t.planType)}
                        <span className={"text-xs font-medium " + (t.isActive ? "text-green-600" : "text-red-500")}>{t.isActive ? "● Aktif" : "● Pasif"}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{t.slug}.bizimsite.com · {t.userCount ?? 0} kullanıcı{t.address ? " · " + t.address : ""}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => handleExpandTenant(t.id)} className="btn-icon" title="Kullanıcıları gör">
                        {expandedTenant === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button onClick={() => { setEditTenant(t); setEditData({ planType: t.planType, isActive: t.isActive, expiresAt: t.expiresAt ? t.expiresAt.substring(0,10) : "" }); }} className="btn-icon hover:text-blue-600 hover:bg-blue-50" title="Düzenle">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleToggleActive(t)} className={"p-2 rounded-lg transition " + (t.isActive ? "text-green-500 hover:bg-green-50" : "text-red-400 hover:bg-red-50")} title={t.isActive ? "Pasife al" : "Aktife al"}>
                        {t.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => handleDelete(t.id, t.name)} className="btn-icon hover:text-red-600 hover:bg-red-50" title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {expandedTenant === t.id && (
                    <div className="border-t bg-gray-50 px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">KULLANICILAR</p>
                      {tenantUsers.length === 0 ? (
                        <p className="text-xs text-gray-400">Kullanıcı bulunamadı.</p>
                      ) : (
                        <div className="space-y-1">
                          {tenantUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between text-xs py-1">
                              <span className="text-gray-700 font-medium">{u.name}</span>
                              <span className="text-gray-400">{u.email} · <span className="text-indigo-500">{u.role}</span></span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PLAN_FEATURES = [
  { label: "Maks. Daire", basic: "50 daire", premium: "150 daire", enterprise: "Sınırsız" },
  { label: "Aidat Yönetimi", basic: true, premium: true, enterprise: true },
  { label: "Duyurular", basic: true, premium: true, enterprise: true },
  { label: "Talepler / Şikayetler", basic: true, premium: true, enterprise: true },
  { label: "Sohbet Paneli", basic: true, premium: true, enterprise: true },
  { label: "Çöp Takibi", basic: true, premium: true, enterprise: true },
  { label: "Mali Yönetim", basic: true, premium: true, enterprise: true },
  { label: "Ödünç Paneli", basic: false, premium: true, enterprise: true },
  { label: "Kapıcı Rolü", basic: false, premium: true, enterprise: true },
  { label: "Raporlar & Grafikler", basic: false, premium: true, enterprise: true },
  { label: "Özel Domain", basic: false, premium: false, enterprise: true },
  { label: "Öncelikli Destek", basic: false, premium: false, enterprise: true },
  { label: "Veri Yedekleme", basic: "30 gün", premium: "90 gün", enterprise: "Sınırsız" },
];

const PlansTab = () => {
  const plans = [
    { key: "basic", label: "Basic", price: "₺299", period: "/ay", icon: Star, color: "gray", highlight: false,
      desc: "Küçük apartmanlar için temel özellikler" },
    { key: "premium", label: "Premium", price: "₺599", period: "/ay", icon: Zap, color: "indigo", highlight: true,
      desc: "Orta-büyük binalar için gelişmiş özellikler" },
    { key: "enterprise", label: "Enterprise", price: "₺999", period: "/ay", icon: Crown, color: "amber", highlight: false,
      desc: "Büyük siteler için tüm özellikler" },
  ];

  const cell = (val) => {
    if (val === true)  return <Check size={16} className="text-green-500 mx-auto" />;
    if (val === false) return <X size={16} className="text-gray-300 mx-auto" />;
    return <span className="text-xs font-semibold text-gray-600">{val}</span>;
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-6">Plan Karşılaştırması</h2>

      {/* Plan Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 md:mb-8">
        {plans.map(({ key, label, price, period, icon: Icon, color, highlight, desc }) => (
          <div key={key} className={`rounded-xl border-2 p-6 flex flex-col ${
            highlight
              ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100"
              : "border-gray-200 bg-white"
          }`}>
            {highlight && (
              <div className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full w-fit mb-3">
                ⭐ En Popüler
              </div>
            )}
            <div className={`inline-flex p-2 rounded-lg mb-3 w-fit bg-${color}-100`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{label}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">{desc}</p>
            <div className="mt-auto">
              <span className="text-2xl md:text-3xl font-extrabold text-gray-900">{price}</span>
              <span className="text-gray-400 text-sm">{period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Özellik Tablosu */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-gray-600 font-semibold w-1/2">Özellik</th>
              {plans.map(p => (
                <th key={p.key} className={`text-center px-4 py-3 font-bold ${p.highlight ? "text-indigo-700" : "text-gray-700"}`}>
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map((feat, i) => (
              <tr key={feat.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-5 py-3 text-gray-700 font-medium">{feat.label}</td>
                <td className="px-4 py-3 text-center">{cell(feat.basic)}</td>
                <td className="px-4 py-3 text-center">{cell(feat.premium)}</td>
                <td className="px-4 py-3 text-center">{cell(feat.enterprise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Plan değişikliği için ilgili binanın düzenleme ekranını kullanın.
      </p>
    </div>
  );
};

export default SuperAdminPanel;
