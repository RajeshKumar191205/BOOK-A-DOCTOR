import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ApplyDoctor = () => {
   const navigate = useNavigate();
   const [formData, setFormData] = useState({
      fullName: '', email: '', phone: '', address: '',
      specialization: '', experience: '', fees: '', timings: ''
   });
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');
      try {
         const res = await fetch('/api/user/registerdoc', {
            method: 'POST',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token'),
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
         });
         const data = await res.json();
         if (data.success) {
            setMessage('✅ ' + (data.message || 'Application submitted! Awaiting admin approval.'));
         } else {
            setMessage('❌ ' + (data.message || 'Error applying. Please try again.'));
         }
      } catch (error) {
         setMessage('❌ Connection error. Please try again.');
         console.log(error);
      } finally {
         setLoading(false);
      }
   };

   const fields = [
      { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Dr. John Smith' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'doctor@email.com' },
      { name: 'phone', label: 'Phone', type: 'text', placeholder: '9876543210' },
      { name: 'address', label: 'Clinic Address', type: 'text', placeholder: 'Clinic location' },
      { name: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Cardiologist' },
      { name: 'experience', label: 'Experience', type: 'text', placeholder: 'e.g. 5 years' },
      { name: 'fees', label: 'Consultation Fees (₹)', type: 'number', placeholder: '500' },
      { name: 'timings', label: 'Timings', type: 'text', placeholder: 'e.g. 9 AM - 5 PM' },
   ];

   return (
      <div style={{ maxWidth: '680px' }}>
         <h4 style={{ marginBottom: '24px', fontWeight: '700' }}>💊 Apply as a Doctor</h4>

         {message && (
            <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
               {message}
            </div>
         )}

         <div style={{
            background: '#fff', borderRadius: '12px', padding: '28px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
         }}>
            <form onSubmit={handleSubmit}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {fields.map(field => (
                     <div key={field.name}>
                        <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block', fontSize: '14px' }}>
                           {field.label}
                        </label>
                        <input
                           type={field.type}
                           name={field.name}
                           className="form-control"
                           placeholder={field.placeholder}
                           value={formData[field.name]}
                           onChange={handleChange}
                           required
                        />
                     </div>
                  ))}
               </div>
               <button
                  type="submit"
                  className="btn mt-4 w-100"
                  style={{ background: '#eab308', color: '#000', fontWeight: '600', padding: '12px' }}
                  disabled={loading}
               >
                  {loading ? 'Submitting...' : 'Submit Application'}
               </button>
            </form>
         </div>
      </div>
   );
};

export default ApplyDoctor;
