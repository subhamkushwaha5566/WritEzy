import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BACKEND_URL } from '../config';

const Feed = () => {
    const [blogs, setBlogs] = useState([]);
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const currentPage = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        
        const fetchFeed = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${BACKEND_URL}/api/feed?page=${currentPage}`, { 
                    headers: { 'Authorization': `Bearer ${token}` },
                    withCredentials: true 
                });
                setBlogs(res.data.blogs);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error("Failed to fetch feed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, [currentPage, user, navigate]);

    if (!user) return null;

    return (
        <div className="glass-container mt-5 mb-5 pb-5" style={{ minHeight: '80vh' }}>
            <h2 className="fw-bold mb-5 text-dark text-center display-5" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>My Feed <i className="bi bi-collection-play text-primary"></i></h2>

            {loading ? (
                <div className="text-center my-5 py-5">
                    <div className="spinner-border text-dark" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            ) : (
                <>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {blogs.length > 0 ? blogs.map(blog => (
                            <div className="col animate__animated animate__fadeInUp" key={blog._id}>
                                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden blog-card">
                                    <div className="position-relative">
                                        <img src={`${BACKEND_URL}${blog.coverimageURL}`} className="card-img-top object-fit-cover" alt="Blog Cover" style={{ height: '220px' }} />
                                    </div>
                                    <div className="card-body d-flex flex-column p-4">
                                        <h5 className="card-title fw-bold text-dark mb-3 text-truncate" title={blog.title}>{blog.title}</h5>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="text-muted fw-medium small text-truncate" style={{ maxWidth: '150px' }}>{blog.createdBy?.fullname || 'Anonymous'}</span>
                                            <span className="ms-auto badge bg-white text-dark border rounded-pill shadow-sm"><i className="bi bi-heart-fill me-1 text-danger"></i> {blog.likes?.length || 0}</span>
                                        </div>
                                        <Link to={`/blog/${blog._id}`} className="btn btn-dark mt-auto rounded-pill fw-bold hover-lift w-100 shadow-sm py-2" style={{ background: 'linear-gradient(135deg, #111 0%, #333 100%)', border: 'none' }}>Read Article <i className="bi bi-arrow-right ms-1"></i></Link>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-12 text-center mt-5">
                                <div className="p-5 glass-card rounded-4 shadow-sm">
                                    <h4 className="text-dark fw-bold mb-3">Your feed is empty 📭</h4>
                                    <p className="text-muted fw-medium mb-0">Follow some creators to see their stories here!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <nav className="mt-5 d-flex justify-content-center">
                            <ul className="pagination shadow-sm rounded-pill overflow-hidden">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <Link className="page-link border-0 fw-bold px-4 py-2 text-dark" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(5px)' }} to={currentPage > 1 ? `/feed?page=${currentPage - 1}` : '#'}><i className="bi bi-chevron-left"></i> Previous</Link>
                                </li>
                                <li className="page-item disabled"><span className="page-link border-0 text-white fw-bold px-4 py-2 bg-dark" style={{ background: 'linear-gradient(135deg, #111 0%, #333 100%)' }}>Page {currentPage} of {totalPages}</span></li>
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <Link className="page-link border-0 fw-bold px-4 py-2 text-dark" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(5px)' }} to={currentPage < totalPages ? `/feed?page=${currentPage + 1}` : '#'} >Next <i className="bi bi-chevron-right"></i></Link>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
};

export default Feed;
