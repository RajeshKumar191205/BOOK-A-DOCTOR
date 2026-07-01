import React, { useEffect, useState } from 'react';
import { Badge, Row } from 'antd';
import Notification from '../components/Notification';
import { Link, useNavigate } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import 'bootstrap/dist/css/bootstrap.min.css';

import ApplyDoctor from '../components/ApplyDoctor';
import StoreAppointments from '../components/StoreAppointments';
import DoctorList from '../components/DoctorList';
import AdminDashboard from './AdminDashboard';

const UserHome = () => {
   const [doctors, setDoctors] = useState([]);
   const [userdata, setUserdata] = useState({});
   const [activeMenuItem, setActiveMenuItem] = useState('');
   const navigate = useNavigate();

   const getUserData = async () => {
      try {
         const res = await fetch('/api/user/getuserdata', {
            method: 'POST',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token'),
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
         });
         const data = await res.json();
         if (data.success) {
            setUserdata(data.data);
            localStorage.setItem('userData', JSON.stringify(data.data));
         }
      } catch (error) {
         console.log(error);
      }
   };

   const getDoctorData = async () => {
      try {
         const res = await fetch('/api/user/getalldoctorsu', {
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
         });
         const data = await res.json();
         if (data.success) {
            setDoctors(data.data);
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      const local = JSON.parse(localStorage.getItem('userData') || '{}');
      if (local && local.name) {
         setUserdata(local);
         const role = local.role || (local.type === 'admin' ? 'admin' : (local.isdoctor ? 'doctor' : 'user'));
         if (role === 'admin') {
            setActiveMenuItem('admin-users');
         }
      }
      getUserData();
      getDoctorData();
   }, []);

   const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
   };

   const renderContent = () => {
      const role = userdata.role || (userdata.type === 'admin' ? 'admin' : (userdata.isdoctor ? 'doctor' : 'user'));
      
      if (role === 'admin') {
         return <AdminDashboard activeTab={activeMenuItem} />;
      }

      if (activeMenuItem === 'appointments') {
         return <StoreAppointments />;
      } else if (activeMenuItem === 'applyDoctor') {
         return <ApplyDoctor />;
      } else if (activeMenuItem === 'notifications') {
         return <Notification />;
      } else {
         return (
            <Row>
               {doctors && doctors.map((doctor, index) => (
                  <DoctorList key={index} doctor={doctor} />
               ))}
               {doctors.length === 0 && (
                  <div className="col-12 text-center py-5">
                      <h5 className="text-muted">No approved doctors available yet.</h5>
                  </div>
               )}
            </Row>
         );
      }
   };

   const getMenuItems = () => {
      const role = userdata.role || (userdata.type === 'admin' ? 'admin' : (userdata.isdoctor ? 'doctor' : 'user'));
      if (role === 'admin') {
         return [
            { key: 'admin-users', label: '👥 Users' },
            { key: 'admin-doctors', label: '🩺 Doctors' },
            { key: 'admin-history', label: '📅 Appointments' },
            { key: 'notifications', label: '🔔 Notifications' },
         ];
      }
      return [
         { key: '', label: '🏠 Home' },
         { key: 'appointments', label: '📅 Appointments' },
         ...(!userdata.isdoctor ? [{ key: 'applyDoctor', label: '💊 Apply as Doctor' }] : []),
      ];
   };

   return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
         {/* Sidebar */}
         <div style={{
            width: '220px', background: '#1a1a2e', color: '#fff',
            display: 'flex', flexDirection: 'column', padding: '20px 0',
            position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100
         }}>
            <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
               <h5 style={{ color: '#eab308', fontWeight: 'bold', margin: 0 }}>🏥 MediCareBook</h5>
            </div>
            <nav style={{ padding: '16px 0', flexGrow: 1 }}>
               {getMenuItems().map(item => (
                  <div key={item.key}
                     onClick={() => setActiveMenuItem(item.key)}
                     style={{
                        padding: '12px 20px', cursor: 'pointer',
                        background: activeMenuItem === item.key ? 'rgba(234,179,8,0.2)' : 'transparent',
                        borderLeft: activeMenuItem === item.key ? '3px solid #eab308' : '3px solid transparent',
                        color: activeMenuItem === item.key ? '#eab308' : '#ccc',
                        fontWeight: activeMenuItem === item.key ? '600' : 'normal',
                        transition: 'all 0.2s'
                     }}>
                     {item.label}
                  </div>
               ))}
            </nav>
            <div onClick={handleLogout} style={{
               padding: '12px 20px', cursor: 'pointer', color: '#ff6b6b',
               borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
               🚪 Logout
            </div>
         </div>

         {/* Main Content */}
         <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
               background: '#fff', padding: '12px 24px', display: 'flex',
               justifyContent: 'flex-end', alignItems: 'center',
               borderBottom: '1px solid #e5e7eb', position: 'sticky',
               top: 0, zIndex: 50, gap: '16px'
            }}>
               <Badge count={userdata?.notification?.length || 0} onClick={() => setActiveMenuItem('notifications')}
                  style={{ cursor: 'pointer' }}>
                  <NotificationsIcon style={{ fontSize: '28px', color: '#555' }} />
               </Badge>
               <span style={{ fontWeight: '600', color: '#333' }}>
                  {userdata.isdoctor ? `Dr. ${userdata.name}` : userdata.name || 'User'}
               </span>
            </div>

            {/* Page Body */}
            <div style={{ padding: '24px', background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
               {renderContent()}
            </div>
         </div>
      </div>
   );
};

export default UserHome;
