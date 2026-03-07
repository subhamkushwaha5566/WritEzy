import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const Help = () => {
    const [statusMessage, setStatusMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const res = await axios.post(`${BACKEND_URL}/api/help`, Object.fromEntries(formData));
            setStatusMessage({ type: 'success', text: res.data.success });
            e.target.reset();
        } catch (error) {
            setStatusMessage({ type: 'danger', text: 'An error occurred while sending your query.' });
        }
    };

    return (
        <div className="glass-container pb-5" style={{ minHeight: '100vh' }}>
            <div className="hero-banner text-center mb-5 position-relative overflow-hidden shadow" style={{ padding: '80px 0', background: 'linear-gradient(90deg, rgba(132, 94, 194, 0.9) 0%, rgba(214, 93, 177, 0.9) 50%, rgba(255, 150, 113, 0.9) 100%)', borderRadius: '0 0 40px 40px', boxShadow: '0 10px 30px rgba(132, 94, 194, 0.3)' }}>
                {/* Subtle overlay pattern */}
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.8 }}></div>
                
                <div className="container animate__animated animate__fadeInDown position-relative z-1">
                    <h1 className="fw-bold display-4 text-white mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>How can we help you?</h1>
                    <p className="lead text-white fw-medium opacity-100" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Find answers in our FAQ or reach out to our premium support team.</p>
                </div>
            </div>

            <div className="container mt-4 mb-5 pb-5 animate__animated animate__fadeInUp">

            {statusMessage && (
                <div className={`alert alert-${statusMessage.type} alert-dismissible fade show rounded-4 shadow-sm`} role="alert">
                    {statusMessage.text}
                    <button type="button" className="btn-close" onClick={() => setStatusMessage(null)} aria-label="Close"></button>
                </div>
            )}

            <div className="row g-5">
                <div className="col-lg-6">
                    <h3 className="fw-bold mb-4 text-dark" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>Frequently Asked Questions</h3>
                    <div className="accordion glass-card p-3" id="faqAccordion">
                        <div className="accordion-item border-0 bg-transparent mb-3 overflow-hidden interactive-accordion">
                            <h2 className="accordion-header">
                                <button className="accordion-button fw-bold py-3 collapsed shadow-sm rounded-3 transition-all" type="button" data-bs-toggle="collapse" data-bs-target="#faq1" style={{ background: 'rgba(255,255,255,0.5)', color: '#333' }}>
                                    How do I write a new blog post?
                                </button>
                            </h2>
                            <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div className="accordion-body fw-medium lh-base text-dark bg-white bg-opacity-50 mt-2 rounded-3">
                                    To write a new blog post, simply sign into your account and click on your profile options. There you will find an "Add Blog" button which provides an editor.
                                </div>
                            </div>
                        </div>

                        <div className="accordion-item border-0 bg-transparent mb-3 overflow-hidden interactive-accordion">
                            <h2 className="accordion-header">
                                <button className="accordion-button fw-bold py-3 collapsed shadow-sm rounded-3 transition-all" type="button" data-bs-toggle="collapse" data-bs-target="#faq2" style={{ background: 'rgba(255,255,255,0.5)', color: '#333' }}>
                                    How can I change my profile picture?
                                </button>
                            </h2>
                            <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div className="accordion-body fw-medium lh-base text-dark bg-white bg-opacity-50 mt-2 rounded-3">
                                    Navigate to 'My Profile' from the dropdown menu in the navigation bar. You'll find an 'Update Avatar' button to upload a new cover image.
                                </div>
                            </div>
                        </div>

                        <div className="accordion-item border-0 bg-transparent mb-3 overflow-hidden interactive-accordion">
                            <h2 className="accordion-header">
                                <button className="accordion-button fw-bold py-3 collapsed shadow-sm rounded-3 transition-all" type="button" data-bs-toggle="collapse" data-bs-target="#faq3" style={{ background: 'rgba(255,255,255,0.5)', color: '#333' }}>
                                    Can I reply directly to someone in Community?
                                </button>
                            </h2>
                            <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div className="accordion-body fw-medium lh-base text-dark bg-white bg-opacity-50 mt-2 rounded-3">
                                    Yes! We recently upgraded our discussion system. Just click the straight 'Reply' button under any message to start a direct thread.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg p-4 p-md-5 h-100 interactive-card" style={{ background: 'linear-gradient(135deg, rgba(132, 94, 194, 0.9) 0%, rgba(214, 93, 177, 0.9) 50%, rgba(255, 150, 113, 0.9) 100%)', borderRadius: '24px' }}>
                        <div className="card-body p-0">
                            <h3 className="fw-bold mb-4 text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Contact Support</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-white small text-uppercase opacity-75">Full Name</label>
                                    <input type="text" className="form-control px-3 py-2 rounded-pill shadow-sm custom-input" name="name" required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-white small text-uppercase opacity-75">Email Address</label>
                                    <input type="email" className="form-control px-3 py-2 rounded-pill shadow-sm custom-input" name="email" required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-white small text-uppercase opacity-75">Query Subject</label>
                                    <input type="text" className="form-control px-3 py-2 rounded-pill shadow-sm custom-input" name="subject" required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-white small text-uppercase opacity-75">Message Description</label>
                                    <textarea className="form-control px-3 py-3 rounded-4 shadow-sm custom-input" name="message" rows="4" style={{ resize: 'none' }} required></textarea>
                                </div>
                                <button type="submit" className="btn btn-light w-100 py-3 rounded-pill fw-bold border-0 shadow btn-hover-grow text-dark" style={{ background: '#ffffff' }}>
                                    <i className="bi bi-send-fill me-2 text-primary"></i> Submit Priority Query
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .interactive-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .interactive-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2) !important;
                }
                .interactive-accordion {
                    transition: transform 0.2s ease;
                }
                .interactive-accordion:hover {
                    transform: translateX(5px);
                }
                .custom-input {
                    transition: all 0.3s ease;
                    border: 2px solid transparent !important;
                    background: #ffffff !important;
                    color: #333 !important;
                }
                .custom-input::placeholder {
                    color: #999 !important;
                }
                .custom-input:focus {
                    transform: translateY(-2px);
                    background: #ffffff !important;
                    border-color: #00f2fe !important;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
                    color: #222 !important;
                }
                .btn-hover-grow {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .btn-hover-grow:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
                }
            `}} />
        </div>
    );
};

export default Help;
