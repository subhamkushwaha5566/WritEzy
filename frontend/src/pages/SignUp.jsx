import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const SignUp = () => {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/api/user/signup`, 
                { fullname, email, password },
                { withCredentials: true }
            );
            if (res.data.success) {
                navigate('/signin');
            }
        } catch (err) {
            if (err.response && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center mb-5 pb-5 glass-container" style={{ minHeight: '80vh' }}>
            <div className="card glass-card p-5 mt-5 animate__animated animate__zoomIn" style={{ width: '100%', maxWidth: '450px', border: 'none' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold mb-2">Create an Account</h2>
                    <p className="text-muted">Join WritEzy and start sharing your thoughts.</p>
                </div>
                {error && <div className="alert alert-danger rounded-3 bg-danger text-white border-0 shadow-sm">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} className="form-control rounded-pill shadow-inner" placeholder="John Doe" required style={{ padding: '12px 20px' }} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Email address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control rounded-pill shadow-inner" placeholder="name@example.com" required style={{ padding: '12px 20px' }} />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control rounded-pill shadow-inner" placeholder="********" required style={{ padding: '12px 20px' }} />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-dark w-100 rounded-pill fw-bold shadow mt-2" style={{ padding: '12px', background: 'linear-gradient(135deg, #111 0%, #333 100%)' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'} <i className="bi bi-person-plus-fill ms-1"></i>
                    </button>
                    
                    <div className="text-center mt-4">
                        <p className="mb-0 fw-medium">Already have an account? <Link to="/signin" className="text-decoration-none fw-bold" style={{ color: '#0056b3' }}>Sign in</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
