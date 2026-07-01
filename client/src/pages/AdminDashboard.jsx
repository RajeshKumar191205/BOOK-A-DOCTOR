import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Calendar, Users, ShieldAlert, CheckCircle, XCircle,
  Clock, Activity, TrendingUp, UserCheck
} from 'lucide-react';

const AdminDashboard = ({ activeTab }) => {
  const { authenticatedRequest } = useContext(AuthContext);
  const [usersList, setUsersList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [allStats, setAllStats] = useState({ users: 0, doctors: 0, appointments: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, doctorsRes, appsRes] = await Promise.all([
        authenticatedRequest('/api/auth/users'),
        authenticatedRequest('/api/doctors/all'),
        authenticatedRequest('/api/appointments/all'),
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : {};
      const doctorsData = doctorsRes.ok ? await doctorsRes.json() : {};
      const appsData = appsRes.ok ? await appsRes.json() : {};

      const users = Array.isArray(usersData) ? usersData : (Array.isArray(usersData.data) ? usersData.data : []);
      const doctors = Array.isArray(doctorsData) ? doctorsData : (Array.isArray(doctorsData.data) ? doctorsData.data : []);
      const apps = Array.isArray(appsData) ? appsData : (Array.isArray(appsData.data) ? appsData.data : []);

      setUsersList(users);
      setDoctorsList(doctors);
      setAppointmentsList(apps);
      setAllStats({
        users: users.length,
        doctors: doctors.filter(d => d.status === 'approved').length,
        appointments: apps.length,
        pending: doctors.filter(d => d.status === 'pending').length,
      });
    } catch (err) {
      setError('Connection error. Failed to load administrative records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, [activeTab]);

  const handleUpdateDoctorStatus = async (doctorId, newStatus) => {
    setError('');
    try {
      const res = await authenticatedRequest(`/api/doctors/${doctorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update doctor application status.');
      }
    } catch (err) {
      setError('Connection error. Failed to update doctor application.');
    }
  };

  const approvedApps  = Array.isArray(appointmentsList) ? appointmentsList.filter(a => a.status === 'approved').length : 0;
  const pendingApps   = Array.isArray(appointmentsList) ? appointmentsList.filter(a => a.status === 'pending').length : 0;
  const rejectedApps  = Array.isArray(appointmentsList) ? appointmentsList.filter(a => a.status === 'rejected').length : 0;

  return (
    <div className="dashboard-body">
      {/* Admin approved banner */}
      <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '4px solid var(--success)', marginBottom: '28px' }}>
        <CheckCircle size={18} /> Doctor registration approved status of the user
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ── Overview Stats (always visible) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <StatCard icon={<Users size={22} />}       label="Total Users"          value={allStats.users}        color="#6366f1" />
        <StatCard icon={<UserCheck size={22} />}   label="Active Doctors"        value={allStats.doctors}      color="#0d9488" />
        <StatCard icon={<Calendar size={22} />}    label="Total Appointments"    value={allStats.appointments} color="#3b82f6" />
        <StatCard icon={<Clock size={22} />}       label="Pending Approvals"     value={allStats.pending}      color="#f59e0b" />
      </div>

      {/* ── HISTORY TAB ── */}
      {activeTab === 'admin-history' && (
        <div>
          <div className="page-title-row">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>All Appointments for Admin Panel</h2>
              <p style={{ color: 'var(--text-muted)' }}>Complete system-wide appointment overview.</p>
            </div>
          </div>

          {/* Appointment stats chips */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={chipStyle('#22c55e')}><CheckCircle size={14} /> Approved: {approvedApps}</span>
            <span style={chipStyle('#f59e0b')}><Clock size={14} /> Pending: {pendingApps}</span>
            <span style={chipStyle('#ef4444')}><XCircle size={14} /> Rejected: {rejectedApps}</span>
          </div>

          {loading && <p>Loading...</p>}
          {!loading && appointmentsList.length === 0 ? (
            <EmptyState icon={<Calendar size={48} />} title="No appointments recorded" text="Appointments will appear here once patients book them." />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Appointment ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsList.map((app, idx) => (
                    <tr key={app._id}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app._id}</td>
                      <td style={{ fontWeight: '500' }}>{app.userInfo?.name || app.userId?.name || 'Patient'}</td>
                      <td>Dr. {app.docInfo?.name || app.doctorId?.fullName || app.doctorId?.name || 'Doctor'}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{app.date}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>at {app.time}</div>
                      </td>
                      <td><span className={`badge badge-${app.status}`}>{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'admin-users' && (
        <div>
          <div className="page-title-row">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>All Registered Users</h2>
              <p style={{ color: 'var(--text-muted)' }}>Manage platform users and their access roles.</p>
            </div>
          </div>

          {loading && <p>Loading users...</p>}
          {!loading && usersList.length === 0 ? (
            <EmptyState icon={<Users size={48} />} title="No users found" />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr, idx) => (
                    <tr key={usr._id}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usr._id}</td>
                      <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: (usr.role === 'admin' || usr.type === 'admin') ? '#ef4444' : (usr.role === 'doctor' || usr.type === 'doctor') ? 'var(--primary)' : '#6366f1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0
                        }}>
                          {(usr.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        {usr.name}
                      </td>
                      <td>{usr.email}</td>
                      <td>{usr.phone}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: '50px', fontWeight: '600', fontSize: '0.8rem',
                          background: (usr.role === 'admin' || usr.type === 'admin') ? '#fee2e2' : (usr.role === 'doctor' || usr.type === 'doctor') ? 'var(--primary-light)' : '#ede9fe',
                          color: (usr.role === 'admin' || usr.type === 'admin') ? '#dc2626' : (usr.role === 'doctor' || usr.type === 'doctor') ? 'var(--primary)' : '#7c3aed'
                        }}>
                          {(usr.role || usr.type || 'user').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── DOCTORS TAB ── */}
      {activeTab === 'admin-doctors' && (
        <div>
          <div className="page-title-row">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>All Doctors</h2>
              <p style={{ color: 'var(--text-muted)' }}>Approve or reject doctor registration applications.</p>
            </div>
          </div>

          {loading && <p>Loading doctor profiles...</p>}
          {!loading && doctorsList.length === 0 ? (
            <EmptyState icon={<ShieldAlert size={48} />} title="No doctor profiles found" text="Applications will appear here once users apply." />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Specialization</th>
                    <th>Fees</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorsList.map((doc, idx) => (
                    <tr key={doc._id}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: '600' }}>Dr. {doc.fullName || doc.name}</td>
                      <td>{doc.email}</td>
                      <td>{doc.phone}</td>
                      <td>
                        <span style={{ color: 'var(--primary)', fontWeight: '500' }}>{doc.specialization}</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.experience}</div>
                      </td>
                      <td>₹{doc.fees}</td>
                      <td><span className={`badge badge-${doc.status}`}>{doc.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {doc.status === 'pending' ? (
                            <>
                              <button className="btn btn-success" style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                                onClick={() => handleUpdateDoctorStatus(doc._id, 'approved')}>
                                Approve
                              </button>
                              <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                                onClick={() => handleUpdateDoctorStatus(doc._id, 'rejected')}>
                                Reject
                              </button>
                            </>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                              {doc.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'var(--card-bg)', borderRadius: 'var(--radius)', padding: '20px 24px',
    boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: '16px',
    transition: 'transform 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ background: `${color}20`, borderRadius: '10px', padding: '10px', color }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
    </div>
  </div>
);

const EmptyState = ({ icon, title, text }) => (
  <div className="form-card" style={{ textAlign: 'center', padding: '50px' }}>
    <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>{icon}</div>
    <h3>{title}</h3>
    {text && <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{text}</p>}
  </div>
);

const chipStyle = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '6px 14px', borderRadius: '50px', fontWeight: '600',
  fontSize: '0.85rem', background: `${color}18`, color
});

export default AdminDashboard;
