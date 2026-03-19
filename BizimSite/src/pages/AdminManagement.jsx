import React, { useEffect, useState } from 'react';
import { Shield, Crown, Mail, Phone, Home } from 'lucide-react';
import { getAdmins } from '../services/api';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdmins()
      .then(res => setAdmins(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (loading) return (
    <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-400">Yükleniyor...</p>
    </div>
  );

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Shield className="text-blue-500" /> Yöneticiler
          </h1>
          <p className="text-slate-500 mt-1">Site yöneticileri ve iletişim bilgileri</p>
        </div>

        <div className="grid gap-4">
          {admins.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <Shield size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Henüz yönetici bilgisi yok</p>
            </div>
          ) : admins.map((admin, i) => (
            <div key={admin.id || i} className="card p-6 flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${admin.isMainAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {getInitials(admin.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">{admin.name}</span>
                  {admin.isMainAdmin && (
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      <Crown size={10} /> Ana Yönetici
                    </span>
                  )}
                  {!admin.isMainAdmin && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Yönetici</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                  {admin.email && (
                    <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" /> {admin.email}</span>
                  )}
                  {admin.phone && (
                    <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" /> {admin.phone}</span>
                  )}
                  {admin.no && (
                    <span className="flex items-center gap-1.5"><Home size={13} className="text-slate-400" /> Daire {admin.no}{admin.block ? ` (${admin.block} Blok)` : ''}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
