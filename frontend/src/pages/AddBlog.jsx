import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AddBlog = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('Technology');
    const [coverImage, setCoverImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) navigate('/signin');
    }, [user, navigate]);

    const handleFileChange = (e) => setCoverImage(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('body', body);
        formData.append('category', category);
        formData.append('coverImage', coverImage);

        try {
            const res = await axios.post(`http://${window.location.hostname}:5000/api/blog`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                navigate(`/blog/${res.data.blogId}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to publish blog.');
        } finally {
            setLoading(false);
        }
    };



    if (!user) return null;

    return (
        <div className="glass-container mt-5 mb-5 pb-5">
            <div className="row justify-content-center animate__animated animate__fadeInUp">
                <div className="col-lg-10">
                    <div className="card glass-card shadow-lg border-0 rounded-4 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)' }}>
                        <div className="card-header border-0 pb-4 pt-5 px-4 px-md-5 text-center" style={{ background: 'linear-gradient(135deg, #1fa2ff 0%, #12d8fa 50%, #a6ffcb 100%)' }}>
                            <h1 className="fw-bolder mb-0 text-dark display-5" style={{ textShadow: '0 2px 4px rgba(255,255,255,0.7)' }}><i className="bi bi-pencil-square me-2"></i> Compose Article</h1>
                            <p className="lead text-dark fw-bold mt-2 opacity-75">Share your knowledge with our vibrant community.</p>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            {error && <div className="alert alert-danger rounded-4 shadow-sm">{error}</div>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="row g-4 mb-4">
                                    <div className="col-md-6">
                                        <label htmlFor="title" className="form-label fw-bold text-dark small text-uppercase ms-1">Blog Title</label>
                                        <input type="text" className="form-control form-control-lg rounded-pill shadow-inner px-4 py-3 blog-input border-0" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your story a catchy title..." required />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="category" className="form-label fw-bold text-dark small text-uppercase ms-1">Category</label>
                                        <select className="form-select form-select-lg rounded-pill shadow-inner px-4 py-3 text-dark blog-input border-0" id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                            <option value="Technology">Technology</option>
                                            <option value="Lifestyle">Lifestyle</option>
                                            <option value="Education">Education</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Gaming">Gaming</option>
                                            <option value="Fitness">Fitness</option>
                                            <option value="News">News</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="coverImage" className="form-label fw-bold text-dark small text-uppercase ms-1">Cover Image</label>
                                    <input className="form-control form-control-lg rounded-pill shadow-inner px-4 py-2 blog-input border-0" type="file" id="coverImage" name="coverImage" onChange={handleFileChange} required />
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="body" className="form-label fw-bold text-dark small text-uppercase ms-1">Body Content</label>
                                    <textarea className="form-control rounded-4 shadow-inner px-4 py-4 blog-input border-0" id="body" name="body" rows="14" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your brilliant thoughts here..." style={{ resize: 'vertical' }} required></textarea>
                                </div>
                                <div className="d-grid mt-4">
                                    <button type="submit" className="btn btn-primary rounded-pill py-3 fw-bolder fs-5 shadow-lg text-uppercase publish-btn" disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> : <><i className="bi bi-send-fill me-2"></i> Publish Beautiful Article</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS styles for the interactive form elements */}
            <style dangerouslySetInnerHTML={{ __html: `
                .blog-input {
                    background: rgba(255,255,255,0.6) !important;
                    transition: all 0.3s ease;
                    border: 2px solid transparent !important;
                }
                .blog-input:focus {
                    background: rgba(255,255,255,0.95) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(31, 162, 255, 0.2) !important;
                    border-color: #1fa2ff !important;
                }
                .publish-btn {
                    background: linear-gradient(135deg, #1fa2ff 0%, #12d8fa 50%, #0072ff 100%);
                    border: none;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .publish-btn:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 15px 30px rgba(31, 162, 255, 0.4) !important;
                }
            `}} />
        </div>
    );
};

export default AddBlog;
