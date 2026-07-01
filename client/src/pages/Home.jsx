import React from 'react';
import { Link } from 'react-router-dom';
import doctorsImg from '../assets/doctors.jpg';

const Home = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">
          <span>BOOK A DOCTOR</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      </nav>
      
      <main className="hero-section">
        <div className="hero-text">
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '20px' }}>
            Effortlessly schedule your doctor
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '500px' }}>
            appointments with just a few clicks, putting your health in your hands.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.1rem', backgroundColor: '#eab308', color: '#000', fontWeight: '600' }}>
            Book your Doctor
          </Link>
        </div>
        <div className="hero-image">
          <img src={doctorsImg} alt="Doctors Team" style={{ width: '100%', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }} />
        </div>
      </main>
      
      <footer className="footer">
        <p>&copy; 2026 Copyright: MediCareBook</p>
      </footer>
    </div>
  );
};

export default Home;
