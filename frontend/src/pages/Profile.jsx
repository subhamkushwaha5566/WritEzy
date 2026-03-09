import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BACKEND_URL } from '../config';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser, setUser: setCurrentUser } = useContext(AuthContext);
    const [profileUser, setProfileUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [totalLikes, setTotalLikes] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/user/profile/${id}`);
                setProfileUser(res.data.userProfile);
                setBlogs(res.data.blogs);
                setTotalLikes(res.data.totalLikes);
            } catch (err) {
                console.error("Profile fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleFollowToggle = async () => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/user/follow/${id}`, {}, { withCredentials: true });
            if (res.data.success) {
                setProfileUser(prev => ({
                    ...prev,
                    followers: res.data.isFollowing 
                        ? [...prev.followers, currentUser._id]
                        : prev.followers.filter(fid => fid !== currentUser._id)
                }));
                // Realistically, currentUser state should also update to reflect the new following list to keep UI in sync globally
                setCurrentUser(prev => ({
                    ...prev,
                    following: res.data.isFollowing
                        ? [...(prev.following || []), id]
                        : (prev.following || []).filter(fid => fid !== id)
                }));
            }
        } catch (err) {
            console.error("Follow error", err);
        }
    };

    const handleAvatarUpload = async (e) => {
        e.preventDefault();
        const file = e.target.avatar.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${BACKEND_URL}/api/user/upload-avatar`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            if (res.data.success) {
                setProfileUser(res.data.user);
                setCurrentUser(res.data.user); // Update global contextual user so navbar updates!
            }
        } catch (err) {
            console.error("Upload error", err);
        }
    };

    if (loading) return <div className="text-center my-5"><div className="spinner-border"></div></div>;
    if (!profileUser) return <div className="container mt-5"><div className="alert alert-danger">User not found.</div></div>;

    const isOwnProfile = currentUser && currentUser._id === profileUser._id;
    const isFollowing = currentUser && profileUser.followers?.includes(currentUser._id);

    const getAvatarUrl = (profileUrl, name) => {
        if (!profileUrl || profileUrl.includes('deafult.webp') || profileUrl.includes('default.webp')) {
            return `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
        }
        return `${BACKEND_URL}${profileUrl}`;
    };

    return (
        <div className="container mt-5 mb-5 pb-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                        <div className="bg-primary" style={{ height: '150px' }}></div>
                        <div className="card-body position-relative px-4 pb-4 px-md-5 pb-md-5 pt-0">
                            <div className="d-flex flex-column flex-md-row mb-4">
                                <div className="position-relative me-md-4 mb-3 mb-md-0 text-center" style={{ marginTop: '-65px' }}>
                                    <div className="d-inline-block position-relative">
                                        <img src={getAvatarUrl(profileUser.ProfileImageURL || profileUser.profileImageURL, profileUser.fullname)} alt="Profile" className="rounded-circle border border-white border-4 shadow bg-white object-fit-cover" style={{ width: '130px', height: '130px' }} />
                                        {isOwnProfile && (
                                            <button className="btn btn-dark rounded-circle position-absolute bottom-0 end-0 shadow-sm" style={{ width: '40px', height: '40px', padding: '0' }} data-bs-toggle="modal" data-bs-target="#avatarModal">
                                                <i className="bi bi-camera-fill"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="text-center text-md-start mt-3 mt-md-4 flex-grow-1">
                                    <h2 className="fw-bold mb-1 text-dark">{profileUser.fullname}</h2>
                                    <p className="text-muted mb-3"><i className="bi bi-envelope me-2"></i>{profileUser.email}</p>
                                </div>
                                <div className="mt-2 mt-md-4 text-center text-md-end">
                                    {currentUser && !isOwnProfile && (
                                        <button onClick={handleFollowToggle} className={`btn btn${isFollowing ? '-outline' : ''}-primary rounded-pill px-4 py-2 fw-bold shadow-sm`}>
                                            <i className={`bi bi-${isFollowing ? 'person-check-fill' : 'person-plus-fill'} me-2`}></i> 
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                    {isOwnProfile && (
                                        <Link to="/add-blog" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"><i className="bi bi-pencil-square me-2"></i>Add Blog</Link>
                                    )}
                                </div>
                            </div>
                            
                            <hr className="mb-4 mt-2" />
                            
                            <div className="row mt-4 px-1 g-2 row-cols-2">
                                <div className="col"><div className="stat-card p-2 p-md-3 h-100"><div className="stat-number fs-3 fs-md-2">{blogs.length}</div><div className="stat-label">Blogs</div></div></div>
                                <div className="col"><div className="stat-card p-2 p-md-3 h-100"><div className="stat-number fs-3 fs-md-2">{totalLikes}</div><div className="stat-label">Likes</div></div></div>
                                <div className="col"><div className="stat-card p-2 p-md-3 h-100"><div className="stat-number fs-3 fs-md-2">{profileUser.followers?.length || 0}</div><div className="stat-label">Followers</div></div></div>
                                <div className="col"><div className="stat-card p-2 p-md-3 h-100"><div className="stat-number fs-3 fs-md-2">{profileUser.following?.length || 0}</div><div className="stat-label">Following</div></div></div>
                            </div>
                        </div>
                    </div>

                    <h3 className="fw-bold mb-4">{isOwnProfile ? 'My Published Blogs' : 'Published Blogs'}</h3>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {blogs.length > 0 ? (
                            blogs.map(blog => (
                                <div className="col" key={blog._id}>
                                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden blog-card">
                                        <img src={`${BACKEND_URL}${blog.coverimageURL}`} className="card-img-top object-fit-cover" alt="Cover" style={{ height: '200px' }} />
                                        <div className="card-body p-4 d-flex flex-column">
                                            <h5 className="card-title fw-bold text-dark text-truncate mb-auto">{blog.title}</h5>
                                            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                                <small className="text-muted"><i className="bi bi-calendar3 me-1"></i> {new Date(blog.createdAt).toLocaleDateString()}</small>
                                                <span className="badge bg-light text-primary rounded-pill shadow-sm"><i className="bi bi-heart-fill me-1 text-danger"></i> {blog.likes.length}</span>
                                            </div>
                                            <Link to={`/blog/${blog._id}`} className="btn btn-outline-primary mt-3 rounded-pill fw-bold w-100">Read Article <i className="bi bi-arrow-right ms-1"></i></Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 mt-2">
                                <div className="p-5 bg-white rounded-4 shadow-sm text-center">
                                    <i className="bi bi-journal-x display-1 text-muted opacity-50 mb-3 block"></i>
                                    <h5 className="text-muted fw-bold mt-3">{profileUser.fullname} hasn't published anything yet.</h5>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal for Avatar */}
                    <div className="modal fade" id="avatarModal" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow rounded-4">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Update Profile Picture</h5>
                                    <button type="button" className="btn-close shadow-none" data-bs-dismiss="modal"></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={(e) => { handleAvatarUpload(e); document.querySelector('#avatarModal .btn-close').click(); }}>
                                        <div className="mb-4">
                                            <input type="file" className="form-control" name="avatar" required accept="image/*" />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold">Upload Setup Image</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
