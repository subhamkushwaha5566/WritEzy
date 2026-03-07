import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BACKEND_URL } from '../config';

const BlogView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    
    // Smart Reading Mode States
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const [readingTime, setReadingTime] = useState(0);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/blog/${id}`);
                const fetchedBlog = res.data.blog;
                setBlog(fetchedBlog);
                setComments(res.data.comments);
                
                // Calculate estimated reading time (avg 200 words per minute)
                const textOnly = fetchedBlog.body.replace(/<[^>]*>?/gm, ''); // strip html tags if any
                const wordCount = textOnly.split(/\s+/).length;
                setReadingTime(Math.ceil(wordCount / 200));
                
            } catch (err) {
                console.error("Error fetching blog", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    const handleLike = async () => {
        if (!user) return navigate('/signin');
        try {
            const res = await axios.post(`${BACKEND_URL}/api/blog/like/${id}`, {}, { withCredentials: true });
            if (res.data.success) {
                setBlog({ ...blog, likes: res.data.isLiked ? [...blog.likes, user._id] : blog.likes.filter(l => l !== user._id) });
            }
        } catch (err) {
            console.error("Like failed", err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;
        try {
            const res = await axios.post(`${BACKEND_URL}/api/blog/delete/${id}`, {}, { withCredentials: true });
            if (res.data.success) {
                navigate('/');
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/signin');
        if (!commentText.trim()) return;

        try {
            const res = await axios.post(`${BACKEND_URL}/api/blog/comment/${id}`, { content: commentText }, { withCredentials: true });
            if (res.data.success) {
                setComments([{ ...res.data.comment, createdBy: user }, ...comments]);
                setCommentText('');
            }
        } catch (err) {
            console.error("Comment failed", err);
        }
    };

    if (loading) return <div className="text-center my-5"><div className="spinner-border"></div></div>;
    if (!blog) return <div className="container mt-5"><div className="alert alert-danger">Blog not found.</div></div>;

    const isAuthor = user && (blog.createdBy._id === user._id || user.role === 'ADMIN');
    const isLiked = user && blog.likes.includes(user._id);

    // Smart Sentence Highlighter Logic
    const getProcessedBody = () => {
        let processedBody = blog.body.replace(/\n/g, '<br />');
        if (isHighlightMode) {
            const keywords = ['important', 'crucial', 'key', 'critical', 'essential', 'must', 'significant', 'vital'];
            // Split by sentences basic heuristic
            const sentences = processedBody.match(/[^.!?]+[.!?]+/g) || [processedBody];
            processedBody = sentences.map(sentence => {
                const lowerSentence = sentence.toLowerCase();
                const containsKeyword = keywords.some(kw => lowerSentence.includes(kw));
                if (containsKeyword) {
                    return `<mark class="bg-warning text-dark px-1 rounded">${sentence}</mark>`;
                }
                return sentence;
            }).join('');
        }
        return processedBody;
    };

    return (
        <div className={`container-fluid min-vh-100 ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'} transition-all`} style={{ transition: 'all 0.4s ease' }}>
            {/* Floating Smart Reading Toolbar */}
            <div className={`position-fixed bottom-0 end-0 m-4 p-3 rounded-pill shadow-lg d-flex gap-3 z-3 ${isDarkMode ? 'bg-secondary' : 'bg-white border'}`} style={{ transition: 'all 0.3s' }}>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`btn rounded-circle p-2 ${isDarkMode ? 'btn-light text-dark' : 'btn-dark text-light'}`} title="Toggle Dark Mode">
                    <i className={`fs-5 bi bi-${isDarkMode ? 'sun-fill' : 'moon-stars-fill'}`}></i>
                </button>
                <button onClick={() => setIsFocusMode(!isFocusMode)} className={`btn rounded-circle p-2 ${isFocusMode ? 'btn-primary' : 'btn-outline-primary'}`} title="Toggle Focus Mode">
                    <i className="fs-5 bi bi-distribute-vertical"></i>
                </button>
                <button onClick={() => setIsHighlightMode(!isHighlightMode)} className={`btn rounded-circle p-2 ${isHighlightMode ? 'btn-warning text-dark' : 'btn-outline-warning'}`} title="Highlight Key Sentences">
                    <i className="fs-5 bi bi-highlighter"></i>
                </button>
            </div>

            <div className="container mt-5 mb-5 pb-5 pt-3">
                <div className="row justify-content-center">
                    <div className={isFocusMode ? 'col-lg-8' : 'col-lg-10'}>
                        {/* Header */}
                        <div className="mb-4">
                            <h1 className="fw-bold display-4 mb-3" style={isFocusMode ? {textAlign: 'center'} : {}}>{blog.title}</h1>
                            
                            {!isFocusMode && (
                                <div className={`d-flex align-items-center justify-content-between pb-3 border-bottom ${isDarkMode ? 'border-secondary' : ''}`}>
                                    <div className="d-flex align-items-center">
                                        <Link to={`/profile/${blog.createdBy._id}`} className="text-decoration-none d-flex align-items-center">
                                            <img src={`${BACKEND_URL}${blog.createdBy.ProfileImageURL || blog.createdBy.profileImageURL || '/deafult.webp'}`} alt="Author" className="rounded-circle me-3 object-fit-cover shadow-sm" style={{ width: '50px', height: '50px' }} />
                                            <div>
                                                <h6 className={`mb-0 fw-bold ${isDarkMode ? 'text-light' : 'text-dark'}`}>{blog.createdBy.fullname}</h6>
                                                <small className={isDarkMode ? 'text-light-50' : 'text-muted'}>{new Date(blog.createdAt).toLocaleDateString()}</small>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <span className={`badge ${isDarkMode ? 'bg-info text-dark' : 'bg-info text-white'} border px-3 py-2 rounded-pill fs-6`}>
                                            <i className="bi bi-tag-fill me-2"></i> {blog.category || 'Featured'}
                                        </span>
                                        <span className={`badge ${isDarkMode ? 'bg-secondary text-light' : 'bg-light text-dark'} border px-3 py-2 rounded-pill fs-6`}>
                                            <i className="bi bi-clock-history me-2"></i> {readingTime} min read
                                        </span>
                                        <div className="d-flex gap-2">
                                            <button onClick={handleLike} className={`btn btn${isLiked ? '' : '-outline'}-danger rounded-pill fw-bold shadow-sm px-4`}>
                                                <i className={`bi bi-heart${isLiked ? '-fill' : ''} me-2`}></i> {blog.likes.length}
                                            </button>
                                            {isAuthor && (
                                                <button onClick={handleDelete} className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} rounded-pill fw-bold shadow-sm px-4`}>
                                                    <i className="bi bi-trash me-2"></i> Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Centered Focus Mode Meta */}
                            {isFocusMode && (
                                <div className="text-center mb-4 text-muted d-flex justify-content-center align-items-center gap-3">
                                    <span>By {blog.createdBy.fullname}</span>
                                    <span>•</span>
                                    <span className="text-info fw-bold"><i className="bi bi-tag-fill me-1"></i> {blog.category || 'Featured'}</span>
                                    <span>•</span>
                                    <span><i className="bi bi-clock-history me-1"></i> {readingTime} min read</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        {!isFocusMode && <img src={`${BACKEND_URL}${blog.coverimageURL}`} className="img-fluid rounded-4 shadow-sm mb-5 w-100 object-fit-cover" style={{ maxHeight: '500px' }} alt="Cover" />}
                        
                        <div className={`blog-body fs-5 mb-5 ${isFocusMode ? 'fs-4' : ''}`} style={{ lineHeight: '1.9', letterSpacing: isFocusMode ? '0.3px' : 'normal' }} dangerouslySetInnerHTML={{ __html: getProcessedBody() }} />
                        </div>

                    {/* Comments - Hidden in Focus Mode */}
                    {!isFocusMode && (
                        <div className={`mt-5 pt-4 border-top ${isDarkMode ? 'border-secondary' : ''}`}>
                            <h3 className="fw-bold mb-4">Comments ({comments.length})</h3>
                            {user ? (
                                <form onSubmit={handleCommentSubmit} className={`d-flex align-items-start mb-5 p-3 rounded-4 shadow-sm border ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
                                    <img src={`${BACKEND_URL}${user.ProfileImageURL || user.profileImageURL || '/deafult.webp'}`} alt="You" className="rounded-circle me-3 object-fit-cover" style={{ width: '45px', height: '45px' }} />
                                    <div className="flex-grow-1">
                                        <textarea value={commentText} onChange={e => setCommentText(e.target.value)} className={`form-control border-0 rounded-3 px-3 py-2 mb-2 ${isDarkMode ? 'bg-secondary text-light' : 'bg-light text-dark'}`} rows="2" placeholder="Share your thoughts..." required></textarea>
                                        <div className="text-end">
                                            <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">Comment</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className={`alert rounded-4 text-center mb-5 border-0 ${isDarkMode ? 'alert-dark text-light bg-secondary' : 'alert-secondary'}`}>
                                    Please <Link to="/signin" className="fw-bold text-primary text-decoration-none">Sign In</Link> to leave a comment.
                                </div>
                            )}

                            <div className="comments-list mt-4">
                                {comments.map(c => (
                                    <div key={c._id} className="d-flex mb-4">
                                        <img src={`${BACKEND_URL}${c.createdBy?.ProfileImageURL || c.createdBy?.profileImageURL || '/deafult.webp'}`} alt="Avatar" className="rounded-circle me-3 shadow-sm object-fit-cover" style={{ width: '45px', height: '45px' }} />
                                        <div className={`p-3 rounded-4 border w-100 shadow-sm ${isDarkMode ? 'bg-secondary border-dark text-light' : 'bg-light text-dark'}`}>
                                            <h6 className="fw-bold mb-1">{c.createdBy?.fullname || 'Unknown'}</h6>
                                            <p className={`mb-0 ${isDarkMode ? 'text-light' : 'text-dark'}`}>{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogView;
