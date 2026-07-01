import React, { useState } from 'react';

const BookingModal = ({ show, handleClose, doctor, userdata }) => {
   const [date, setDate] = useState('');
   const [time, setTime] = useState('');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');

   const handleBook = async () => {
      if (!date || !time) {
         setMessage('Please select both date and time.');
         return;
      }
      setLoading(true);
      setMessage('');
      try {
         const res = await fetch('/api/appointments/book', {
            method: 'POST',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token'),
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               doctorId: doctor._id,
               date,
               time,
               userId: userdata?._id
            })
         });
         const data = await res.json();
         if (data.success) {
            setMessage('✅ Appointment booked successfully!');
            setTimeout(() => {
               handleClose();
               setMessage('');
               setDate('');
               setTime('');
            }, 1500);
         } else {
            setMessage(data.message || 'Failed to book appointment.');
         }
      } catch (error) {
         setMessage('Connection error. Please try again.');
         console.log(error);
      } finally {
         setLoading(false);
      }
   };

   if (!show) return null;

   return (
      <div style={{
         position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
         display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}>
         <div style={{
            background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '440px',
            padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
         }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h5 style={{ margin: 0, fontWeight: '700' }}>Book Appointment</h5>
               <button onClick={handleClose} style={{
                  border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#999'
               }}>✕</button>
            </div>

            <div style={{ marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
               <p style={{ margin: 0, fontWeight: '600' }}>Dr. {doctor.fullName}</p>
               <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{doctor.specialization} • Fees: ₹{doctor.fees}</p>
            </div>

            <div className="mb-3">
               <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Date</label>
               <input
                  type="date"
                  className="form-control"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
               />
            </div>

            <div className="mb-3">
               <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Time</label>
               <input
                  type="time"
                  className="form-control"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
               />
            </div>

            {message && (
               <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'} py-2`}>
                  {message}
               </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
               <button className="btn btn-secondary flex-fill" onClick={handleClose}>Cancel</button>
               <button
                  className="btn flex-fill"
                  style={{ background: '#eab308', color: '#000', fontWeight: '600' }}
                  onClick={handleBook}
                  disabled={loading}
               >
                  {loading ? 'Booking...' : 'Confirm Booking'}
               </button>
            </div>
         </div>
      </div>
   );
};

export default BookingModal;
