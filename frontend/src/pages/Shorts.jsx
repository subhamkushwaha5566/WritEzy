import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';

const Shorts = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        fetchShorts();
    }, [user, navigate]);

    const fetchShorts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/shorts`, { withCredentials: true });
            if (res.data.success) {
                setShorts(res.data.shorts);
            }
        } catch (err) {
            console.error("Failed to fetch shorts:", err);
            setError("Failed to load feed. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview({
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : (file.type.startsWith('audio/') ? 'audio' : 'image')
            });
        }
    };

    const clearFile = () => {
        setMediaFile(null);
        setMediaPreview(null);
        // reset file input
        const fileInput = document.getElementById('mediaUpload');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !mediaFile) {
            setError("Cannot post an empty short. Express yourself!");
            return;
        }

        setSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('content', content);
        if (mediaFile) {
            formData.append('media', mediaFile);
        }

        try {
            const res = await axios.post(`${BACKEND_URL}/api/shorts`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                // Prepend new short
                setShorts([res.data.short, ...shorts]);
                setContent('');
                clearFile();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to post.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (id) => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/shorts/like/${id}`, {}, { withCredentials: true });
            if (res.data.success) {
                setShorts(shorts.map(s => {
                    if (s._id === id) {
                        return { ...s, likes: res.data.isLiked ? [...s.likes, user._id] : s.likes.filter(l => l !== user._id) };
                    }
                    return s;
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    return (
        <div className="glass-container pb-5" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-7 col-md-9">
                        
                        <div className="text-center mb-4">
                            <h2 className="fw-bold text-dark display-5" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>Random Thoughts ✨</h2>
                            <p className="lead text-dark fw-medium">Share your poetry, shayari, thoughts, music, or short videos.</p>
                        </div>

                        {/* Compose Post UI */}
                        <div className="card glass-card shadow-sm border-0 rounded-4 overflow-hidden mb-5">
                            <div className="card-body p-4">
                                {error && <div className="alert alert-danger rounded-3 py-2">{error}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="d-flex align-items-start mb-3">
                                        <img src={`${BACKEND_URL}${user.ProfileImageURL || user.profileImageURL || '/default.webp'}`} alt="Me" className="rounded-circle me-3 object-fit-cover shadow-sm" style={{ width: '45px', height: '45px' }} />
                                        <div className="flex-grow-1">
                                            <textarea 
                                                className="form-control border-0 bg-transparent text-dark fs-5 custom-short-input" 
                                                placeholder="What's floating in your mind today? Write poetry, a deep thought..." 
                                                rows="3" 
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                style={{ resize: 'none', boxShadow: 'none' }}
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Media Preview Box */}
                                    {mediaPreview && (
                                        <div className="position-relative mb-3 rounded-4 overflow-hidden border border-light bg-dark bg-opacity-10 d-flex justify-content-center align-items-center" style={{ minHeight: '100px', maxHeight: '300px' }}>
                                            <button type="button" onClick={clearFile} className="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-2 shadow-sm z-3"><i className="bi bi-x"></i></button>
                                            
                                            {mediaPreview.type === 'image' && <img src={mediaPreview.url} alt="Preview" className="img-fluid object-fit-contain h-100" style={{ maxHeight: '300px' }} />}
                                            {mediaPreview.type === 'video' && <video src={mediaPreview.url} controls className="w-100 h-100 object-fit-contain" style={{ maxHeight: '300px' }}></video>}
                                            {mediaPreview.type === 'audio' && (
                                                <div className="p-4 w-100 d-flex flex-column align-items-center">
                                                    <i className="bi bi-music-note-beamed text-dark fs-1 mb-2"></i>
                                                    <audio src={mediaPreview.url} controls className="w-100 mt-2"></audio>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <hr className="border-secondary opacity-25" />
                                    
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex gap-2">
                                            <label className="btn btn-light rounded-pill custom-action-btn fw-bold px-3 text-secondary shadow-sm" style={{ background: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                                <i className="bi bi-image text-primary me-2"></i>Media
                                                <input type="file" id="mediaUpload" className="d-none" accept="image/*,video/*,audio/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <button type="submit" disabled={submitting} className="btn rounded-pill px-4 fw-bold shadow text-white" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: 'none' }}>
                                            {submitting ? 'Posting...' : 'Share World'} <i className="bi bi-stars ms-1"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Feed Stream */}
                        <div className="shorts-feed mb-5">
                            {loading ? (
                                <div className="text-center py-4"><div className="spinner-border text-dark"></div></div>
                            ) : shorts.length === 0 ? (
                                <div className="text-center py-5 glass-card rounded-4">
                                    <h4 className="text-secondary mb-0">It's quiet here. Break the ice!</h4>
                                </div>
                            ) : (
                                shorts.map(short => (
                                    <div key={short._id} className="card glass-card border-0 shadow-sm rounded-4 mb-4 overflow-hidden animate__animated animate__fadeInUp">
                                        {/* User Header */}
                                        <div className="d-flex align-items-center p-3 border-bottom border-light border-opacity-25 pb-2">
                                            <img src={`${BACKEND_URL}${short.createdBy?.ProfileImageURL || short.createdBy?.profileImageURL || '/default.webp'}`} alt="Author" className="rounded-circle me-3 object-fit-cover border border-2 border-white" style={{ width: '40px', height: '40px' }} />
                                            <div>
                                                <Link to={`/profile/${short.createdBy?._id}`} className="text-decoration-none fw-bold text-dark fs-6 d-block">{short.createdBy?.fullname}</Link>
                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(short.createdAt).toLocaleDateString()} at {new Date(short.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                            </div>
                                        </div>
                                        
                                        {/* Content Area (Poetry/Shayari text) */}
                                        {short.content && (
                                            <div className="p-4 bg-white bg-opacity-25">
                                                <p className="mb-0 text-dark lh-lg" style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', fontWeight: '500' }}>{short.content}</p>
                                            </div>
                                        )}

                                        {/* Media Attachment */}
                                        {short.mediaURL && (
                                            <div className="media-container bg-dark flex-grow-1 d-flex justify-content-center align-items-center">
                                                {short.mediaType === 'image' && <img src={`${BACKEND_URL}${short.mediaURL}`} className="img-fluid w-100 object-fit-cover" style={{ maxHeight: '500px' }} alt="Post attachment" />}
                                                {short.mediaType === 'video' && <video src={`${BACKEND_URL}${short.mediaURL}`} controls className="w-100" style={{ maxHeight: '500px', backgroundColor: '#000' }}></video>}
                                                {short.mediaType === 'audio' && (
                                                    <div className="w-100 p-4 bg-light bg-opacity-75 d-flex flex-column align-items-center">
                                                        <i className="bi bi-music-player-fill fs-1 text-primary mb-3"></i>
                                                        <audio src={`${BACKEND_URL}${short.mediaURL}`} controls className="w-100"></audio>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions Footer */}
                                        <div className="p-3 bg-white bg-opacity-50 d-flex justify-content-between align-items-center">
                                            <button onClick={() => handleLike(short._id)} className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${short.likes?.includes(user._id) ? 'btn-danger shadow-sm text-white' : 'btn-light border text-danger'}`}>
                                                <i className={short.likes?.includes(user._id) ? "bi bi-heart-fill me-1" : "bi bi-heart me-1"}></i> {short.likes?.length || 0}
                                            </button>
                                            <button className="btn btn-sm btn-light border rounded-pill px-3 fw-bold text-dark shadow-sm">
                                                <i className="bi bi-share-fill me-1 text-primary"></i> Share
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-short-input::placeholder { color: rgba(0,0,0,0.4); font-style: italic; }
                .custom-action-btn:hover { background: #fff !important; transform: translateY(-1px); }
            `}} />
        </div>
    );
};

export default Shorts;
