import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { BACKEND_URL } from '../config';

const Home = () => {
    const [blogs, setBlogs] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    
    const searchQuery = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || 'All';
    const currentPage = parseInt(searchParams.get('page')) || 1;
    
    const categories = ['All', 'Technology', 'Lifestyle', 'Education', 'Entertainment', 'Gaming', 'Fitness', 'News', 'Others'];

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${BACKEND_URL}/api/blogs?search=${searchQuery}&category=${currentCategory}&page=${currentPage}`);
                setBlogs(res.data.blogs);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error("Failed to fetch blogs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [searchQuery, currentCategory, currentPage]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        const currentCat = searchParams.get('category');
        const newParams = { page: 1 };
        if (query) newParams.search = query;
        if (currentCat && currentCat !== 'All') newParams.category = currentCat;
        setSearchParams(newParams, { replace: true });
    };

    const handleCategoryClick = (category) => {
        const newParams = { page: 1 };
        if (searchQuery) newParams.search = searchQuery;
        if (category !== 'All') newParams.category = category;
        setSearchParams(newParams);
    };

    return (
        <div className="glass-container pb-5" style={{ minHeight: '100vh' }}>
            {/* Hero Section with Search */}
            <div className="hero-banner text-center mb-5 animate__animated animate__fadeIn position-relative overflow-hidden" style={{ padding: '80px 0', background: 'linear-gradient(90deg, rgba(132, 94, 194, 0.9) 0%, rgba(214, 93, 177, 0.9) 50%, rgba(255, 150, 113, 0.9) 100%)', borderRadius: '0 0 40px 40px', boxShadow: '0 10px 30px rgba(132, 94, 194, 0.3)' }}>
                {/* Subtle overlay pattern */}
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.8 }}></div>
                
                <div className="container position-relative z-1">
                    <h1 className="display-4 fw-bold mb-3 text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Discover Amazing Stories</h1>
                    <p className="lead mb-4 fw-medium text-white opacity-100" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Write It. Share It. Inspire</p>
                    
                    <div className="search-bar-wrap animate__animated animate__fadeInUp animate__delay-1s mx-auto" style={{ maxWidth: '600px' }}>
                        <div className="d-flex w-100">
                            <input 
                                className="form-control search-input w-100 rounded-pill px-4 py-3 shadow-inner border-0" 
                                style={{ background: 'rgba(255,255,255,0.7)' }}
                                type="search" 
                                name="search" 
                                placeholder="Search blogs by title..." 
                                aria-label="Search" 
                                value={searchQuery}
                                onChange={handleSearchChange} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Category Pills */}
                <div className="d-flex overflow-auto gap-3 pb-3 mb-4 custom-scrollbar" style={{ whiteSpace: 'nowrap' }}>
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => handleCategoryClick(cat)}
                            className={`btn rounded-pill px-4 fw-bold shadow-sm flex-shrink-0 transition-all ${currentCategory === cat ? 'btn-dark' : 'glass-card border'}`}
                            style={currentCategory === cat ? { background: 'linear-gradient(135deg, #111 0%, #333 100%)', color: 'white' } : {}}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

            {loading ? (
                <div className="text-center my-5 py-5">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            ) : (
                <>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {blogs.length > 0 ? blogs.map(blog => (
                            <div className="col animate__animated animate__fadeInUp" key={blog._id}>
                                <div className="card h-100 blog-card">
                                    <div className="card-img-wrapper">
                                        <img src={`${BACKEND_URL}${blog.coverimageURL}`} className="card-img-top object-fit-cover" alt="Blog Cover" style={{ height: '220px' }} />
                                    </div>
                                    <div className="card-body d-flex flex-column p-4">
                                        <span className={`blog-badge align-self-start ${blog.category ? 'bg-info text-white' : ''}`}>
                                            <i className="bi bi-tag-fill me-1"></i>{blog.category || 'Featured'}
                                        </span>
                                        <h4 className="card-title fw-bold text-dark mt-2 text-truncate" title={blog.title}>{blog.title}</h4>
                                        <p className="card-text text-muted mb-4 small">
                                            By: <span className="fw-semibold text-secondary">{blog.createdBy?.fullname || 'Unknown'}</span> &bull; {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <Link to={`/blog/${blog._id}`} className="btn btn-outline-primary mt-auto rounded-pill fw-bold w-100">Read Article <i className="bi bi-arrow-right ms-1"></i></Link>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-12 text-center mt-5">
                                <div className="p-5 glass-card rounded-4 shadow-sm">
                                    <h2 className="text-dark fw-bold mb-3">No blogs found 😕</h2>
                                    <p className="text-muted fw-medium mb-4">Try adjusting your search or be the first to post!</p>
                                    <Link to="/blog/add-new" className="btn btn-dark rounded-pill px-4 py-2 fw-bold" style={{ background: 'linear-gradient(135deg, #1fa2ff 0%, #0072ff 100%)', border: 'none' }}>Write a Blog</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <nav aria-label="Page navigation" className="mt-5 pt-3">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link shadow-sm rounded-start-pill border-0 text-dark fw-bold" 
                                        style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(5px)' }}
                                        onClick={() => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('page', currentPage - 1); return p; })}
                                    >
                                        <i className="bi bi-chevron-left"></i> Previous
                                    </button>
                                </li>
                                <li className="page-item active">
                                    <span className="page-link shadow-sm border-0 bg-dark text-white fw-bold" style={{ background: 'linear-gradient(135deg, #111 0%, #333 100%)' }}>{currentPage}</span>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link shadow-sm rounded-end-pill border-0 text-dark fw-bold" 
                                        style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(5px)' }}
                                        onClick={() => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('page', currentPage + 1); return p; })}
                                    >
                                        Next <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}
            </div>
        </div>
    );
};

export default Home;
