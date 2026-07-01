import React, { useEffect, useState } from 'react';

const Notification = () => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

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
            setUser(data.data);
         }
      } catch (error) {
         console.log(error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getUserData();
   }, []);

   const markAllRead = async () => {
      try {
         const res = await fetch('/api/user/getallnotification', {
            method: 'POST',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token'),
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
         });
         const data = await res.json();
         if (data.success) {
            getUserData();
         }
      } catch (error) {
         console.log(error);
      }
   };

   const deleteAll = async () => {
      try {
         const res = await fetch('/api/user/deleteallnotification', {
            method: 'POST',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token'),
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
         });
         const data = await res.json();
         if (data.success) {
            getUserData();
         }
      } catch (error) {
         console.log(error);
      }
   };

   if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

   return (
      <div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontWeight: '700', margin: 0 }}>🔔 Notifications</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
               <button className="btn btn-sm btn-primary" onClick={markAllRead}>Mark all as read</button>
               <button className="btn btn-sm btn-danger" onClick={deleteAll}>Delete all</button>
            </div>
         </div>

         <div className="mb-4">
            <h6 style={{ color: '#555', marginBottom: '10px', fontWeight: '600' }}>New</h6>
            {(!user?.notification || user.notification.length === 0) ? (
               <p style={{ color: '#999' }}>No new notifications</p>
            ) : (
               user.notification.map((notif, index) => (
                  <div key={index} className="alert alert-info" style={{ marginBottom: '8px' }}>
                     {notif.message}
                  </div>
               ))
            )}
         </div>

         <div>
            <h6 style={{ color: '#555', marginBottom: '10px', fontWeight: '600' }}>Read</h6>
            {(!user?.seenNotification || user.seenNotification.length === 0) ? (
               <p style={{ color: '#999' }}>No read notifications</p>
            ) : (
               user.seenNotification.map((notif, index) => (
                  <div key={index} className="alert alert-secondary" style={{ marginBottom: '8px' }}>
                     {notif.message}
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

export default Notification;
