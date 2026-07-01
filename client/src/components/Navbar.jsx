import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, token } = useContext(AuthContext);
  const [docStatus, setDocStatus] = useState(null);

  useEffect(() => {
    const checkDoctorStatus = async () => {
      if (user && user.role !== 'admin') {
        try {
          const res = await fetch('http://localhost:8000/api/doctors', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            // Find if there is an application for this user
            const doctors = await res.json();
            // Actually, we can fetch all doctors, but wait: is there a better endpoint?
            // In doctor routes, GET /api/doctors/all is admin-only.
            // But we can check if they are already doctor. Let's make an endpoint or check if user.role === 'doctor'.
            // Or we can just call GET /api/doctors/all, but that's admin only.
            // Let's call a fetch specifically for the user's doctor application, or just check the user object!
            // Wait, we can fetch user profile again or query all approved/pending profiles.
            // A simple way is to check the user object: if user.role === 'doctor' or user.isDoctor, it's approved.
            // If they are not doctor but we want to know if they have a pending application, let's fetch all doctors (approved)
            // or we can implement a /api/doctors/my-status endpoint or check.
            // Let's see: we can query the approved doctors list. If they are in it, they are approved.
            // If they aren't, they are either pending or haven't applied.
            // To make it simple, let's add a GET /api/doctors/profile endpoint or we can just fetch their profile details
            // from the backend. Wait, let's look at doctorController.js. We don't have a profile endpoint, but we can search for doctor profiles
            // in the frontend, or write a quick fetch to see if they have a pending application.
            // Actually, let's check: when they apply, the application status is 'pending'.
            // Let's implement a check in the backend or we can fetch the doctor applications.
            // Let's do a fetch to a general endpoint: we can query the database.
            // Wait, a doctor profile endpoint is extremely useful! Let's write a small fetch or check.
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkDoctorStatus();
  }, [user, token]);

  if (!user) return null;

  // Header display name formatting
  let displayName = user.name;
  if (user.role === 'admin') {
    displayName = 'Hi_Admin';
  } else if (user.role === 'doctor') {
    displayName = user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`;
  } else {
    displayName = 'User';
  }

  return (
    <header className="dashboard-header">
      <h2>Book A Doctor</h2>
      
      <div className="user-profile-badge">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold' }}>
          ■ {displayName}
        </span>
      </div>
    </header>
  );
};

export default Navbar;
