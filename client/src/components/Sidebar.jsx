import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, Calendar, UserPlus, Users, UserCheck,
  History, LogOut, Bell, Stethoscope, LayoutDashboard
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const isAdmin  = user.role === 'admin';
  const isDoctor = user.role === 'doctor';
  const isUser   = user.role === 'user';

  const Item = ({ tab, icon, label }) => (
    <li className={`sidebar-menu-item ${activeTab === tab ? 'active' : ''}`}>
      <a href={`#${tab}`} onClick={e => { e.preventDefault(); setActiveTab(tab); }}>
        {icon} {label}
      </a>
    </li>
  );

  return (
    <div className="sidebar">
      {/* Logo / Brand */}
      <div className="sidebar-logo">
        <Stethoscope size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        {isAdmin ? 'MediCareBook' : 'Book A Doctor'}
      </div>

      {/* User Info chip */}
      <div style={{
        margin: '0 0 24px 0',
        padding: '10px 14px',
        background: 'var(--primary-light)',
        borderRadius: '10px',
        fontSize: '0.85rem',
        color: 'var(--primary)',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0
        }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isAdmin ? 'Hi_Admin' : isDoctor ? user.name : 'User'}
        </span>
      </div>

      <ul className="sidebar-menu">
        {/* ── USER MENU ── */}
        {isUser && (
          <>
            <Item tab="home"          icon={<Home size={18} />}       label="Home" />
            <Item tab="appointments"  icon={<Calendar size={18} />}   label="Appointments" />
            <Item tab="notifications" icon={<Bell size={18} />}       label="Notifications" />
            <Item tab="apply-doctor"  icon={<UserPlus size={18} />}   label="Apply Doctor" />
          </>
        )}

        {/* ── DOCTOR MENU ── */}
        {isDoctor && (
          <>
            <Item tab="doctor-appointments" icon={<Calendar size={18} />} label="Appointments" />
          </>
        )}

        {/* ── ADMIN MENU ── */}
        {isAdmin && (
          <>
            <Item tab="admin-history" icon={<History size={18} />}   label="History" />
            <Item tab="admin-users"   icon={<Users size={18} />}     label="Users" />
            <Item tab="admin-doctors" icon={<UserCheck size={18} />} label="Doctor" />
          </>
        )}
      </ul>

      {/* Logout */}
      <div className="sidebar-menu-item" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <a href="#logout" onClick={e => { e.preventDefault(); logout(); }} style={{ color: '#ef4444' }}>
          <LogOut size={18} /> Logout
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
