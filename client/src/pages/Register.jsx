import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import registerImg from '../assets/login_illustration.jpg';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user'); // default is user
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, phone, role })
      });

      const data = await res.json();

      if (data.success) {
        // Pass the returned user data object (compatible with flat layout) and token
        register(data, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-side">
        <div style={{ marginBottom: '24px' }}>
          <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
            &larr; MediCareBook
          </Link>
        </div>

        <div className="auth-card">
          <h2 style={{ marginBottom: '8px', fontSize: '1.8rem', fontWeight: 'bold' }}>Sign up to your account</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Create an account as a patient or administrator.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Fullname</label>
              <input 
                type="text" 
                id="name" 
                className="form-control" 
                placeholder="Yash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className="form-control" 
                placeholder="yash@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-control" 
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input 
                type="text" 
                id="phone" 
                className="form-control" 
                placeholder="1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="role" 
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                  />
                  Admin
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="role" 
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                  />
                  User
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#eab308', color: '#000', fontWeight: '600' }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Login here</Link>
          </p>
        </div>
      </div>

      <div className="auth-illustration">
        <img src={registerImg} alt="Doctor Consulting Patient" />
      </div>
    </div>
  );
};

export default Register;
