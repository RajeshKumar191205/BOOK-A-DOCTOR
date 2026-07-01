import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { 
  Calendar, FileText, Sparkles, Stethoscope, Search, 
  MapPin, Bell, CheckCircle, XCircle, Clock, Filter,
  Activity, Users, TrendingUp, Star
} from 'lucide-react';

const UserDashboard = ({ activeTab, setActiveTab }) => {
  const { user, authenticatedRequest, setUser } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [myApplication, setMyApplication] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Apply Doctor Form State
  const [applyName, setApplyName] = useState(user?.name || '');
  const [applyEmail, setApplyEmail] = useState(user?.email || '');
  const [applyPhone, setApplyPhone] = useState(user?.phone || '');
  const [applyAddress, setApplyAddress] = useState('');
  const [applySpec, setApplySpec] = useState('');
  const [applyExp, setApplyExp] = useState('');
  const [applyFees, setApplyFees] = useState('');
  const [applyTimings, setApplyTimings] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const docRes = await fetch('http://localhost:8000/api/doctors');
      if (docRes.ok) {
        const docData = await docRes.json();
        setDoctors(docData);
        setFilteredDoctors(docData);
      }

      const appRes = await authenticatedRequest('http://localhost:8000/api/appointments/user');
      if (appRes.ok) {
        const appData = await appRes.json();
        setAppointments(appData);
      }

      const myAppRes = await authenticatedRequest('http://localhost:8000/api/doctors/my-application');
      if (myAppRes.ok) {
        setMyApplication(await myAppRes.json());
      } else {
        setMyApplication(null);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  // Live filter doctors
  useEffect(() => {
    let result = doctors;
    if (searchTerm) {
      result = result.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterSpec) {
      result = result.filter(d => d.specialization.toLowerCase().includes(filterSpec.toLowerCase()));
    }
    if (filterLocation) {
      result = result.filter(d => d.address.toLowerCase().includes(filterLocation.toLowerCase()));
    }
    setFilteredDoctors(result);
  }, [searchTerm, filterSpec, filterLocation, doctors]);

  const handleApplyDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setApplySuccess('');
    try {
      const res = await authenticatedRequest('http://localhost:8000/api/doctors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: applyName, email: applyEmail, phone: applyPhone,
          address: applyAddress, specialization: applySpec,
          experience: applyExp, fees: Number(applyFees), timings: applyTimings
        })
      });
      const data = await res.json();
      if (res.ok) {
        setApplySuccess('Doctor application submitted successfully! Pending admin approval.');
        setMyApplication(data.data);
        fetchData();
      } else {
        setError(data.message || 'Failed to submit application.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Derived stats
  const approvedCount = appointments.filter(a => a.status === 'approved').length;
  const pendingCount  = appointments.filter(a => a.status === 'pending').length;
  const rejectedCount = appointments.filter(a => a.status === 'rejected').length;

  // Dynamic Notification Management Handlers
  const handleMarkAllAsRead = async () => {
    try {
      const res = await authenticatedRequest('http://localhost:8000/api/notifications/get-all', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      }
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const res = await authenticatedRequest('http://localhost:8000/api/notifications/delete-all', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  // Combine unseen and seen notifications for listing
  const unseenNotifications = user?.notification || [];
  const seenNotifications = user?.seenNotification || [];
  const totalNotificationsCount = unseenNotifications.length + seenNotifications.length;

  // Unique specializations for filter dropdown
  const specializations = [...new Set(doctors.map(d => d.specialization))];

  return (
    <div className="dashboard-body">

      {/* Status Notifications Banner */}
      {myApplication?.status === 'pending' && (
        <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '4px solid #2563eb' }}>
          <Bell size={18} /> Doctor Registration request is <strong>pending</strong> admin review.
        </div>
      )}
      {myApplication?.status === 'approved' && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '4px solid var(--success)' }}>
          <CheckCircle size={18} /> Doctor registration is <strong>approved!</strong> Please re-login to access the Doctor Panel.
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ───── HOME TAB ───── */}
      {activeTab === 'home' && (
        <div>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <StatCard icon={<Users size={22} />} label="Total Doctors" value={doctors.length} color="#0d9488" />
            <StatCard icon={<Calendar size={22} />} label="My Appointments" value={appointments.length} color="#6366f1" />
            <StatCard icon={<CheckCircle size={22} />} label="Approved" value={approvedCount} color="#22c55e" />
            <StatCard icon={<Clock size={22} />} label="Pending" value={pendingCount} color="#f59e0b" />
          </div>

          <div className="page-title-row">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Find a Doctor</h2>
              <p style={{ color: 'var(--text-muted)' }}>Browse and filter specialists — book your appointment instantly.</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '28px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Filter size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select
                className="form-control"
                value={filterSpec}
                onChange={e => setFilterSpec(e.target.value)}
                style={{ paddingLeft: '40px' }}
              >
                <option value="">All Specializations</option>
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Filter by location..."
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="form-card" style={{ textAlign: 'center', padding: '40px' }}>
              <Stethoscope size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h3>No doctors found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="doctors-grid">
              {filteredDoctors.map(doctor => (
                <div key={doctor._id} className="doctor-card">
                  {/* Avatar Circle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '4px' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 'bold', fontSize: '1.3rem', flexShrink: 0
                    }}>
                      {doctor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="doctor-name" style={{ border: 'none', padding: 0, marginBottom: '2px' }}>Dr. {doctor.name}</div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '50px' }}>
                        {doctor.specialization}
                      </span>
                    </div>
                  </div>

                  <div className="doctor-detail"><span>📍 Location:</span><span>{doctor.address}</span></div>
                  <div className="doctor-detail"><span>🎓 Experience:</span><span>{doctor.experience}</span></div>
                  <div className="doctor-detail"><span>💰 Fees:</span><span style={{ fontWeight: 'bold', color: '#0d9488' }}>₹{doctor.fees}</span></div>
                  <div className="doctor-detail"><span>🕐 Timings:</span><span>{doctor.timings}</span></div>
                  <div className="doctor-detail"><span>📞 Phone:</span><span>{doctor.phone}</span></div>

                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '12px', width: '100%' }}
                    onClick={() => { setSelectedDoctor(doctor); setIsModalOpen(true); }}
                  >
                    <Calendar size={16} /> Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───── APPOINTMENTS TAB ───── */}
      {activeTab === 'appointments' && (
        <div>
          <div className="page-title-row">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>My Appointments</h2>
              <p style={{ color: 'var(--text-muted)' }}>Full history of your booked appointments and their statuses.</p>
            </div>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span style={chipStyle('#22c55e')}><CheckCircle size={14} /> Approved: {approvedCount}</span>
            <span style={chipStyle('#f59e0b')}><Clock size={14} /> Pending: {pendingCount}</span>
            <span style={chipStyle('#ef4444')}><XCircle size={14} /> Rejected: {rejectedCount}</span>
          </div>

          {appointments.length === 0 ? (
            <div className="form-card" style={{ textAlign: 'center', padding: '40px' }}>
              <Calendar size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h3>No appointments booked yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Go to <strong>Home</strong> to find a doctor and book.</p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('home')}>
                Find a Doctor
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Date & Time</th>
                    <th>Fees</th>
                    <th>Document</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app, idx) => (
                    <tr key={app._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{idx + 1}</td>
                      <td style={{ fontWeight: '600' }}>Dr. {app.doctorId?.name || 'Doctor'}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: '500' }}>{app.doctorId?.specialization || '—'}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{app.date}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>at {app.time}</div>
                      </td>
                      <td>₹{app.doctorId?.fees || '—'}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───── NOTIFICATIONS TAB ───── */}
      {activeTab === 'notifications' && (
        <div>
          <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Notifications</h2>
              <p style={{ color: 'var(--text-muted)' }}>Real-time updates, requests and system alerts.</p>
            </div>
            {totalNotificationsCount > 0 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {unseenNotifications.length > 0 && (
                  <button className="btn btn-primary" onClick={handleMarkAllAsRead} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Mark all as read
                  </button>
                )}
                <button className="btn btn-secondary" onClick={handleClearAllNotifications} style={{ padding: '8px 16px', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}>
                  Clear all
                </button>
              </div>
            )}
          </div>

          {totalNotificationsCount === 0 ? (
            <div className="form-card" style={{ textAlign: 'center', padding: '40px' }}>
              <Bell size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h3>No notifications yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Appointment confirmations and updates will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Unseen / New Notifications */}
              {unseenNotifications.map((n, idx) => (
                <div key={`unseen-${idx}`} style={{
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--radius)',
                  padding: '18px 22px',
                  boxShadow: 'var(--shadow)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  borderLeft: '4px solid var(--primary)',
                  position: 'relative'
                }}>
                  <div style={{ flexShrink: 0, color: 'var(--primary)' }}>
                    <Bell size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{n.message}</p>
                    <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '50px', fontWeight: 'bold' }}>NEW</span>
                  </div>
                </div>
              ))}

              {/* Read / Seen Notifications */}
              {seenNotifications.map((n, idx) => (
                <div key={`seen-${idx}`} style={{
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                  padding: '18px 22px',
                  boxShadow: 'none',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  borderLeft: '4px solid var(--secondary)',
                  opacity: 0.8
                }}>
                  <div style={{ flexShrink: 0, color: 'var(--secondary)' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', marginBottom: '4px', color: 'var(--text-muted)' }}>{n.message}</p>
                    <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: 'var(--secondary)', padding: '2px 8px', borderRadius: '50px', fontWeight: '600' }}>READ</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───── APPLY DOCTOR TAB ───── */}
      {activeTab === 'apply-doctor' && (
        <div>
          <div className="page-title-row">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Apply as a Doctor</h2>
              <p style={{ color: 'var(--text-muted)' }}>Submit your professional details to get registered as a doctor.</p>
            </div>
          </div>

          {applySuccess && <div className="alert alert-success">{applySuccess}</div>}

          {myApplication?.status === 'approved' ? (
            <div className="form-card" style={{ textAlign: 'center', padding: '40px' }}>
              <Sparkles size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
              <h3>Your application is Approved! 🎉</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                You are now a registered doctor. Please log out and log back in to access the Doctor Dashboard.
              </p>
            </div>
          ) : myApplication?.status === 'pending' ? (
            <div className="form-card" style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h3>Application Under Review</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Our admin is verifying your professional details. You'll be notified once approved.
              </p>
            </div>
          ) : (
            <form className="form-card" onSubmit={handleApplyDoctor}>
              <div className="form-section-title">Personal Details</div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="applyName">Full Name</label>
                  <input type="text" id="applyName" className="form-control" value={applyName} onChange={e => setApplyName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="applyPhone">Phone</label>
                  <input type="text" id="applyPhone" className="form-control" value={applyPhone} onChange={e => setApplyPhone(e.target.value)} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="applyEmail">Email</label>
                  <input type="email" id="applyEmail" className="form-control" value={applyEmail} onChange={e => setApplyEmail(e.target.value)} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="applyAddress">Clinic Address / City</label>
                  <input type="text" id="applyAddress" className="form-control" placeholder="e.g., Chennai" value={applyAddress} onChange={e => setApplyAddress(e.target.value)} required />
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: '30px' }}>Professional Details</div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="applySpec">Specialization</label>
                  <input type="text" id="applySpec" className="form-control" placeholder="e.g., Cardiology, Skin, Blood" value={applySpec} onChange={e => setApplySpec(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="applyExp">Experience</label>
                  <input type="text" id="applyExp" className="form-control" placeholder="e.g., 10 yrs" value={applyExp} onChange={e => setApplyExp(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="applyFees">Consultation Fees (₹)</label>
                  <input type="number" id="applyFees" className="form-control" placeholder="e.g., 1000" value={applyFees} onChange={e => setApplyFees(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="applyTimings">Available Timings</label>
                  <input type="text" id="applyTimings" className="form-control" placeholder="e.g., 11:00 - 14:00" value={applyTimings} onChange={e => setApplyTimings(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '24px' }}>
                Submit Application
              </button>
            </form>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedDoctor(null); }}
          onSuccess={() => { fetchData(); setActiveTab('appointments'); }}
        />
      )}
    </div>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius)',
    padding: '20px 24px',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ background: `${color}20`, borderRadius: '10px', padding: '10px', color }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
    </div>
  </div>
);

const chipStyle = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '6px 14px', borderRadius: '50px', fontWeight: '600',
  fontSize: '0.85rem', background: `${color}18`, color
});

export default UserDashboard;
