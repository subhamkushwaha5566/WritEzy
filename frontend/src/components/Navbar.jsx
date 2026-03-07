import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    const getAvatarUrl = (profileUrl, name) => {
        if (!profileUrl || profileUrl === '/public/images/deafult.webp' || profileUrl === '/deafult.webp') {
            return `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
        }
        return `http://${window.location.hostname}:5000${profileUrl}`;
    };

    return (
        <nav className="custom-navbar navbar navbar-expand-lg sticky-top border-bottom" style={{ background: 'linear-gradient(90deg, rgba(132, 94, 194, 0.9) 0%, rgba(214, 93, 177, 0.9) 50%, rgba(255, 150, 113, 0.9) 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottomColor: 'rgba(255,255,255,0.2) !important', padding: '15px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center fw-bold text-white fs-4" to="/">
                    <img src={`http://${window.location.hostname}:5000/logo.png`} alt="Logo" width="40" height="40" className="me-2 object-fit-contain" />
                    WritEzy
                </Link>
                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <i className="bi bi-list text-white fs-1"></i>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 mt-3 mt-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link px-3 text-white" to="/"><i className="bi bi-house-door me-1"></i>Home</Link>
                        </li>
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link px-3 text-white" to="/feed"><i className="bi bi-collection-play me-1"></i>My Feed</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link px-3 text-white fw-bold" to="/shorts" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}><i className="bi bi-stars text-warning me-1"></i>Random Thoughts</Link>
                                </li>
                            </>
                        )}
                        <li className="nav-item">
                            <Link className="nav-link px-3 text-white" to="/discussion"><i className="bi bi-chat-text me-1"></i>Community</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3 text-white" to="/help"><i className="bi bi-info-circle me-1"></i>Help</Link>
                        </li>
                    </ul>
                    {user ? (
                        <div className="dropdown mt-3 mt-lg-0">
                            <Link className="nav-link dropdown-toggle d-flex align-items-center fw-bold text-white" to="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <img src={getAvatarUrl(user.ProfileImageURL || user.profileImageURL, user.fullname)} alt="Profile" className="rounded-circle me-2 object-fit-cover shadow-sm" style={{ width: '32px', height: '32px' }} />
                                {user.fullname}
                            </Link>
                            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                                <li><Link className="dropdown-item py-2" to={`/profile/${user._id}`}><i className="bi bi-person-circle me-2"></i>My Profile</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item py-2 text-danger fw-bold" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                            </ul>

                        </div>
                    ) : (
                        <ul className="navbar-nav align-items-center">
                            <li className="nav-item me-2 mb-3 mb-lg-0 w-100 text-center w-lg-auto">
                                <Link className="nav-link btn-signin d-inline-block w-75 w-lg-auto text-center" to="/signin">
                                    <i className="bi bi-box-arrow-in-right me-2 fs-5 align-middle"></i>Sign In
                                </Link>
                            </li>
                            <li className="nav-item w-100 text-center w-lg-auto mb-2 mb-lg-0">
                                <Link className="nav-link btn-signup d-inline-block w-75 w-lg-auto text-center" to="/signup">
                                    <i className="bi bi-person-plus-fill me-2 fs-5 align-middle"></i>Create Account
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
