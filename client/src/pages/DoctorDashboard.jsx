import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, FileText, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

const DoctorDashboard = ({ activeTab }) => {
  const { authenticatedRequest } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const res = await authenticatedRequest('http://localhost:8000/api/appointments/doctor');
      if (res.ok) {
        setAppointments(await res.json());
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to load appointments.');
      }
    } catch (err) {
      setError('Connection error. Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctorAppointments(); }, [activeTab]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setError('');
    try {
      const res = await authenticatedRequest(`http://localhost:8000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDoctorAppointments();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update status.');
      }
    } catch (err) {
      setError('Connection error. Failed to update status.');
    }
  };

  const approvedCount = appointments.filter(a => a.status === 'approved').length;
  const pendingCount  = appointments.filter(a => a.status === 'pending').length;
  const rejectedCount = appointments.filter(a => a.status === 'rejected').length;

  return (
    <div className="dashboard-body">
      {/* Approval Banner */}
      <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '4px solid var(--success)' }}>
        <CheckCircle size={18} /> Doctor registration is <strong>approved</strong> now
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard icon={<Calendar size={22} />}    label="Total Requests"  value={appointments.length} color="#6366f1" />
        <StatCard icon={<CheckCircle size={22} />} label="Approved"        value={approvedCount}       color="#22c55e" />
        <StatCard icon={<Clock size={22} />}       label="Pending"         value={pendingCount}        color="#f59e0b" />
        <StatCard icon={<XCircle size={22} />}     label="Rejected"        value={rejectedCount}       color="#ef4444" />
      </div>

      <div className="page-title-row">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>All Appointments</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage and respond to incoming patient appointment requests.</p>
        </div>
      </div>

      {loading && <p>Loading appointments...</p>}

      {!loading && appointments.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '50px' }}>
          <Calendar size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h3>No appointment requests yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Booking requests from patients will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Date & Time</th>
                <th>Phone</th>
                <th>Document</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app, idx) => (
                <tr key={app._id}>
                  <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0
                      }}>
                        {(app.userId?.name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{app.userId?.name || 'Patient'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.userId?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{app.userId?.email || '—'}</td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{app.date}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>at {app.time}</div>
                  </td>
                  <td>{app.userId?.phone || '—'}</td>
                  <td>
                    <a
                      href={`http://localhost:8000/uploads/${app.document}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}
                    >
                      <FileText size={15} /> View
                    </a>
                  </td>
                  <td><span className={`badge badge-${app.status}`}>{app.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {app.status === 'pending' ? (
                        <>
                          <button className="btn btn-success" style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                            onClick={() => handleUpdateStatus(app._id, 'approved')}>
                            Approve
                          </button>
                          <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                            onClick={() => handleUpdateStatus(app._id, 'rejected')}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No action</span>
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
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'var(--card-bg)', borderRadius: 'var(--radius)', padding: '20px 24px',
    boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s',
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

export default DoctorDashboard;
