import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Discussion = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [replyToId, setReplyToId] = useState(null); // Active form id

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`http://${window.location.hostname}:5000/api/discussion`);
            setMessages(res.data.messages);
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleSubmit = async (e, parentId = null) => {
        e.preventDefault();
        const text = parentId ? e.target.replyContent.value : content;
        if (!text.trim() || !user) return;

        try {
            await axios.post(`http://${window.location.hostname}:5000/api/discussion`, { content: text, replyToId: parentId }, { withCredentials: true });
            if (!parentId) setContent('');
            setReplyToId(null);
            fetchMessages(); // refresh map to get populated replyTo details!
        } catch (err) {
            console.error("Post Error:", err);
        }
    };
    const getAvatarUrl = (profileUrl, name) => {
        if (!profileUrl || profileUrl === '/public/images/deafult.webp' || profileUrl === '/deafult.webp') {
            return `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
        }
        return `http://${window.location.hostname}:5000${profileUrl}`;
    };

    return (
        <div className="bg-light min-vh-100 pb-5">
            <div className="hero-banner text-center mb-5 border-0 shadow-lg position-relative overflow-hidden" style={{ padding: '100px 0', background: 'linear-gradient(90deg, rgba(132, 94, 194, 0.9) 0%, rgba(214, 93, 177, 0.9) 50%, rgba(255, 150, 113, 0.9) 100%)', borderRadius: '0 0 40px 40px' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }}></div>
                <div className="container position-relative z-1 animate__animated animate__fadeInDown">
                    <span className="badge bg-white text-primary rounded-pill px-3 py-2 mb-3 shadow-sm fw-bold border"><i className="bi bi-stars text-warning me-1"></i> Global Hub</span>
                    <h1 className="fw-bold display-4 text-white mb-3 text-shadow">Community Discussion <i className="bi bi-chat-quote-fill text-white ms-2 opacity-75"></i></h1>
                    <p className="text-white lead fw-medium opacity-100 mb-0 px-4" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>Share ideas, ask for help, or bounce thoughts off each other globally!</p>
                </div>
            </div>

            <div className="container mt-4 mb-5 pb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">

                        {user ? (
                            <div className="card border-0 shadow-lg rounded-4 mb-5 p-1 bg-white animate__animated animate__zoomIn">
                                <div className="card-body p-4">
                                    <form onSubmit={(e) => handleSubmit(e, null)}>
                                        <div className="d-flex mb-4">
                                            <img src={getAvatarUrl(user.ProfileImageURL || user.profileImageURL, user.fullname)} alt="You" className="rounded-circle me-3 mt-1 shadow-sm border border-2 border-primary object-fit-cover" style={{ width: '50px', height: '50px' }} />
                                            <div className="flex-grow-1 position-relative">
                                                <textarea value={content} onChange={e => setContent(e.target.value)} className="form-control border-light bg-light rounded-4 px-4 py-3 shadow-inner custom-focus" rows="3" placeholder="What's on your mind? Start a new discussion..." required style={{ resize: 'none' }}></textarea>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted small"><i className="bi bi-info-circle me-1"></i> Keep it friendly and respectful</span>
                                            <button type="submit" className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center btn-hover-grow">
                                                Post <i className="bi bi-send-fill ms-2"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="card text-center rounded-4 border-0 mb-5 py-5 shadow-sm bg-white animate__animated animate__fadeIn">
                                <div className="card-body">
                                    <div className="display-1 text-primary mb-3 opacity-50"><i className="bi bi-chat-dots"></i></div>
                                    <h3 className="fw-bold text-dark mb-3">Join the Conversation</h3>
                                    <p className="mb-4 text-muted fs-5">Sign in to share your thoughts, ask questions, and connect with the community.</p>
                                    <Link to="/signin" className="btn btn-primary btn-lg rounded-pill px-5 shadow fw-bold">Sign In Now <i className="bi bi-arrow-right ms-2"></i></Link>
                                </div>
                            </div>
                        )}

                        <div className="discussion-board position-relative">
                            {/* Decorative timeline line */}
                            <div className="position-absolute h-100 bg-primary opacity-25 d-none d-md-block" style={{ width: '2px', left: '25px', top: '0', zIndex: '0' }}></div>

                            {messages.length === 0 ? (
                                <div className="text-center text-muted py-5 animate__animated animate__fadeIn">
                                    <i className="bi bi-inbox display-1 text-muted opacity-25 mb-4 d-block"></i>
                                    <h3 className="fw-bold">No discussions yet.</h3>
                                    <p>Be the brave first one to start a topic!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={msg._id} className={`card border-0 shadow rounded-4 mb-4 position-relative z-1 overflow-hidden discussion-card animate__animated animate__fadeInUp animate__delay-${index % 5}s`} style={{ transition: 'transform 0.2s', ':hover': { transform: 'translateY(-5px)' } }}>
                                        <div className="card-body p-4 p-md-5">
                                            <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                                                <div className="d-flex align-items-center">
                                                    <Link to={`/profile/${msg.createdBy._id}`} className="position-relative">
                                                        <img src={getAvatarUrl(msg.createdBy.ProfileImageURL || msg.createdBy.profileImageURL, msg.createdBy.fullname)} alt="User" className="rounded-circle me-3 shadow-sm border border-2 border-white object-fit-cover" style={{ width: '55px', height: '55px' }} />
                                                        <span className="position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle me-2 mb-1" style={{ width: '12px', height: '12px' }}></span>
                                                    </Link>
                                                    <div>
                                                        <Link to={`/profile/${msg.createdBy._id}`} className="text-decoration-none text-dark">
                                                            <h5 className="fw-bold mb-0 user-hover">{msg.createdBy.fullname}</h5>
                                                        </Link>
                                                        <small className="text-muted fw-medium"><i className="bi bi-clock me-1"></i>{new Date(msg.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="badge bg-light text-secondary rounded-pill border"><i className="bi bi-hash"></i>Discussion</span>
                                                </div>
                                            </div>

                                            {msg.replyToMessage && (
                                                <div className="bg-light p-3 rounded-4 mb-4 position-relative overflow-hidden mb-3 border shadow-sm" style={{ borderLeft: '4px solid #0dcaf0 !important' }}>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-info text-dark rounded-pill fw-bold"><i className="bi bi-reply-fill me-1"></i>Replying to @{msg.replyToMessage.createdBy?.fullname}</span>
                                                    </div>
                                                    <p className="mb-0 text-muted fst-italic ps-2" style={{ borderLeft: '2px solid #ccc' }}>"{msg.replyToMessage.content}"</p>
                                                </div>
                                            )}

                                            <p className="card-text text-dark fs-5 mb-4 lh-base" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>

                                            {user && (
                                                <div className="d-flex align-items-center mt-2 position-relative z-2">
                                                    <button onClick={() => setReplyToId(replyToId === msg._id ? null : msg._id)} className={`btn btn-sm rounded-pill px-4 py-2 fw-bold shadow-sm transition-all ${replyToId === msg._id ? 'btn-danger' : 'btn-outline-primary bg-light'}`}>
                                                        <i className={`bi ${replyToId === msg._id ? 'bi-x-circle-fill' : 'bi-reply-fill'} me-2`}></i>
                                                        {replyToId === msg._id ? 'Cancel Reply' : 'Reply to Thread'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Inline Reply Form with Animation */}
                                            {replyToId === msg._id && user && (
                                                <div className="mt-4 pt-4 border-top animate__animated animate__fadeInDown animate__faster bg-light p-3 rounded-4 mt-3">
                                                    <form onSubmit={(e) => handleSubmit(e, msg._id)} className="d-flex">
                                                        <img src={getAvatarUrl(user.ProfileImageURL || user.profileImageURL, user.fullname)} alt="You" className="rounded-circle me-3 shadow-sm border border-2 border-white object-fit-cover" style={{ width: '40px', height: '40px' }} />
                                                        <div className="flex-grow-1">
                                                            <textarea name="replyContent" className="form-control border-0 bg-white rounded-4 px-3 py-3 fs-6 mb-3 shadow-sm custom-focus" rows="2" placeholder={`Write your reply to @${msg.createdBy.fullname}...`} required autoFocus style={{ resize: 'none' }}></textarea>
                                                            <div className="d-flex justify-content-end gap-2">
                                                                <button type="button" onClick={() => setReplyToId(null)} className="btn btn-sm btn-light rounded-pill px-3 fw-bold shadow-sm border text-muted">Cancel</button>
                                                                <button type="submit" className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm">Send Reply <i className="bi bi-send ms-1"></i></button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .discussion-card {
                    transition: all 0.3s ease;
                }
                .discussion-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                }
                .btn-hover-grow {
                    transition: transform 0.2s ease;
                }
                .btn-hover-grow:hover {
                    transform: scale(1.05);
                }
                .custom-focus:focus {
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                    border-color: #86b7fe;
                }
                .user-hover {
                    transition: color 0.2s;
                }
                .user-hover:hover {
                    color: #0d6efd !important;
                }
            `}} />
        </div>
    );
};

export default Discussion;
