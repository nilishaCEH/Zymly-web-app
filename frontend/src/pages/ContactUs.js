import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Instagram, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContactUs = () => {
  const [content, setContent] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API}/content/contact`);
        const contentMap = {};
        response.data.forEach(item => {
          contentMap[item.section] = item;
        });
        setContent(contentMap);
      } catch (err) {
        console.error('Error fetching content:', err);
      }
    };
    fetchContent();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/contact/submit`, formData, { timeout: 60000 });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('The server is starting up — please wait a moment and try again.');
      } else {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map(e => e.msg || JSON.stringify(e)).join(' '));
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError('Something went wrong. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E0D8C8] pt-20" data-testid="contact-page">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-[#C8A25F] font-medium mb-2 block">Let's Connect</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2B3033] tracking-tighter mb-6">
              {content.info?.title || 'Get in Touch'}
            </h1>
            <p className="text-lg text-[#2B3033]/70 leading-relaxed">
              {content.info?.content || "Have questions about our products, want to collaborate, or just want to say hi? Drop us a message and we'll get back to you as soon as possible."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {success ? (
                <div className="bg-[#F2EFE8] rounded-3xl p-12 text-center" data-testid="contact-success">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2B3033] mb-4">Message Sent!</h3>
                  <p className="text-[#2B3033]/70 mb-6">
                    Thank you for reaching out. We'll get back to you soon!
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn-secondary"
                    data-testid="send-another-message"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-[#F2EFE8] rounded-3xl p-8 md:p-12" data-testid="contact-form">
                  <h3 className="text-2xl font-bold text-[#2B3033] mb-6">Send us a message</h3>
                  
                  {error && (
                    <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-6" data-testid="contact-error">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-[#2B3033] font-medium">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="mt-2 bg-white border-[#2B3033]/20 focus:border-[#C8A25F] focus:ring-[#C8A25F]"
                        data-testid="contact-name-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-[#2B3033] font-medium">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="mt-2 bg-white border-[#2B3033]/20 focus:border-[#C8A25F] focus:ring-[#C8A25F]"
                        data-testid="contact-email-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-[#2B3033] font-medium">Phone (optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="mt-2 bg-white border-[#2B3033]/20 focus:border-[#C8A25F] focus:ring-[#C8A25F]"
                        data-testid="contact-phone-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-[#2B3033] font-medium">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help..."
                        className="mt-2 bg-white border-[#2B3033]/20 focus:border-[#C8A25F] focus:ring-[#C8A25F] resize-none"
                        data-testid="contact-message-input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      data-testid="contact-submit-button"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Send Message
                          <Send size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-[#2B3033] rounded-3xl p-8 md:p-12 text-[#E0D8C8]">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C8A25F]/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#C8A25F]" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Email</p>
                      <a 
                        href="mailto:support@zymly.in"
                        className="text-[#E0D8C8]/70 hover:text-[#C8A25F] transition-colors"
                        data-testid="contact-email-link"
                      >
                        support@zymly.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C8A25F]/20 flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-5 h-5 text-[#C8A25F]" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Instagram</p>
                      <a
                        href="https://www.instagram.com/go_zymly"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#E0D8C8]/70 hover:text-[#C8A25F] transition-colors"
                        data-testid="contact-instagram-link"
                      >
                        @go_zymly
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C8A25F]/20 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#C8A25F]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium mb-1">WhatsApp</p>
                      <a
                        href="https://wa.me/919243432249"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#E0D8C8]/70 hover:text-[#C8A25F] transition-colors"
                        data-testid="contact-whatsapp-link"
                      >
                        +91 92434 32249
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#F2EFE8] rounded-3xl p-8 md:p-12">
                <img 
                  src="https://customer-assets.emergentagent.com/job_zymly-mission/artifacts/retece6k_1180243_fotor-2026012315320_1769161062478.png" 
                  alt="Zymly" 
                  className="w-full max-w-xs mx-auto mb-6"
                />
                <p className="text-center text-[#2B3033]/70">
                  We're always excited to hear from fellow health enthusiasts, potential partners, or anyone curious about our probiotic journey!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
