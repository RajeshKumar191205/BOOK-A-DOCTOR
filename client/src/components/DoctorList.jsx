import React, { useState } from 'react';
import BookingModal from './BookingModal';

const DoctorList = ({ doctor }) => {
   const [show, setShow] = useState(false);
   const userdata = JSON.parse(localStorage.getItem('userData') || '{}');

   return (
      <>
         <div style={{
            width: '280px', margin: '12px', background: '#fff', borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden',
            border: '1px solid #e5e7eb', transition: 'transform 0.2s',
         }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
         >
            <div style={{ background: '#1a1a2e', padding: '16px', color: '#fff' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                     width: '48px', height: '48px', borderRadius: '50%',
                     background: '#eab308', display: 'flex', alignItems: 'center',
                     justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#000'
                  }}>
                     {(doctor.fullName || 'D')[0].toUpperCase()}
                  </div>
                  <div>
                     <h6 style={{ margin: 0, fontWeight: '700' }}>Dr. {doctor.fullName}</h6>
                     <span style={{ fontSize: '12px', color: '#eab308' }}>{doctor.specialization}</span>
                  </div>
               </div>
            </div>
            <div style={{ padding: '16px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#555', marginBottom: '14px' }}>
                  <div>📞 {doctor.phone}</div>
                  <div>📍 {doctor.address}</div>
                  <div>🎓 Experience: {doctor.experience}</div>
                  <div>🕒 Timings: {doctor.timings}</div>
                  <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '14px' }}>💰 Fees: ₹{doctor.fees}</div>
               </div>
               <button
                  onClick={() => setShow(true)}
                  className="btn btn-sm w-100"
                  style={{ background: '#eab308', color: '#000', fontWeight: '600', padding: '8px' }}
               >
                  Book Appointment
               </button>
            </div>
         </div>

         <BookingModal
            show={show}
            handleClose={() => setShow(false)}
            doctor={doctor}
            userdata={userdata}
         />
      </>
   );
};

export default DoctorList;
