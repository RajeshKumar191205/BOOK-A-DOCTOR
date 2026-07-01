import React, { useEffect, useState } from 'react';

const StoreAppointments = () => {
   const [appointments, setAppointments] = useState([]);
   const [loading, setLoading] = useState(true);

   const getAppointments = async () => {
      try {
         const res = await fetch('/api/appointments/user', {
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
         });
         const data = await res.json();
         if (data.success && Array.isArray(data.data)) {
            setAppointments(data.data);
         } else if (Array.isArray(data)) {
            setAppointments(data);
         }
      } catch (error) {
         console.log('Error fetching appointments:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getAppointments();
   }, []);

   const getStatusBadge = (status) => {
      const colors = { approved: '#22c55e', pending: '#f59e0b', rejected: '#ef4444' };
      return (
         <span style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            background: colors[status] || '#999', color: '#fff'
         }}>
            {status?.toUpperCase() || 'PENDING'}
         </span>
      );
   };

   if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

   return (
      <div>
         <h4 style={{ marginBottom: '20px', fontWeight: '700' }}>📅 My Appointments</h4>
         {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
               <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
               <p>No appointments booked yet. Browse doctors and book one!</p>
            </div>
         ) : (
            <div className="table-responsive">
               <table className="table table-bordered table-hover">
                  <thead style={{ background: '#1a1a2e', color: '#fff' }}>
                     <tr>
                        <th>#</th>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {appointments.map((app, index) => (
                        <tr key={app._id || index}>
                           <td>{index + 1}</td>
                           <td>{app.docInfo?.name || app.doctorId?.fullName || 'Doctor'}</td>
                           <td>{app.docInfo?.specialization || app.doctorId?.specialization || '-'}</td>
                           <td>{app.date || '-'}</td>
                           <td>{app.time || '-'}</td>
                           <td>{getStatusBadge(app.status)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
};

export default StoreAppointments;
