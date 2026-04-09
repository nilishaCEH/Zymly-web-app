import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MailOpen, Trash2, Phone, Calendar, X } from 'lucide-react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SubmissionsManager = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${API}/submissions`, { withCredentials: true });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/submissions/${id}/read`, {}, { withCredentials: true });
      fetchSubmissions();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      await axios.delete(`${API}/submissions/${id}`, { withCredentials: true });
      fetchSubmissions();
      setSelectedSubmission(null);
      setMessage({ type: 'success', text: 'Submission deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete submission' });
    }
  };

  const openSubmission = (submission) => {
    setSelectedSubmission(submission);
    if (!submission.is_read) {
      markAsRead(submission.id);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E0D8C8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C8A25F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0D8C8]" data-testid="submissions-manager-page">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/admin/dashboard"
              className="w-10 h-10 rounded-full bg-[#F2EFE8] flex items-center justify-center hover:bg-[#2B3033] hover:text-[#E0D8C8] transition-colors"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#2B3033]">Contact Submissions</h1>
              <p className="text-[#2B3033]/60 text-sm">
                {submissions.filter(s => !s.is_read).length} unread messages
              </p>
            </div>
          </div>

          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {/* Submissions List */}
          {submissions.length === 0 ? (
            <div className="bg-[#F2EFE8] rounded-xl p-12 text-center">
              <Mail className="w-16 h-16 text-[#2B3033]/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#2B3033] mb-2">No submissions yet</h3>
              <p className="text-[#2B3033]/60">Contact form submissions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission, index) => (
                <div
                  key={submission.id}
                  onClick={() => openSubmission(submission)}
                  className={`bg-[#F2EFE8] rounded-xl p-4 border cursor-pointer transition-all hover:border-[#C8A25F] ${
                    submission.is_read ? 'border-[#2B3033]/10' : 'border-[#C8A25F] bg-[#C8A25F]/5'
                  }`}
                  data-testid={`submission-item-${index}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      submission.is_read ? 'bg-[#2B3033]/10' : 'bg-[#C8A25F]'
                    }`}>
                      {submission.is_read ? (
                        <MailOpen size={18} className="text-[#2B3033]/50" />
                      ) : (
                        <Mail size={18} className="text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-bold truncate ${submission.is_read ? 'text-[#2B3033]/70' : 'text-[#2B3033]'}`}>
                          {submission.name}
                        </h3>
                        {!submission.is_read && (
                          <span className="px-2 py-0.5 bg-[#C8A25F] text-white text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#2B3033]/60 truncate mb-1">{submission.email}</p>
                      <p className="text-sm text-[#2B3033]/50 truncate">{submission.message}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#2B3033]/50">{formatDate(submission.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl bg-[#F2EFE8] border-[#2B3033]/10">
          <DialogHeader>
            <DialogTitle className="text-[#2B3033]">Message Details</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6" data-testid="submission-detail">
              <div className="flex items-center gap-4 pb-4 border-b border-[#2B3033]/10">
                <div className="w-14 h-14 rounded-full bg-[#C8A25F] flex items-center justify-center text-white text-xl font-bold">
                  {selectedSubmission.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2B3033]">{selectedSubmission.name}</h3>
                  <a 
                    href={`mailto:${selectedSubmission.email}`}
                    className="text-[#C8A25F] hover:underline"
                  >
                    {selectedSubmission.email}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedSubmission.phone && (
                  <div className="flex items-center gap-2 text-[#2B3033]/70">
                    <Phone size={16} />
                    <span>{selectedSubmission.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#2B3033]/70">
                  <Calendar size={16} />
                  <span>{formatDate(selectedSubmission.created_at)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#2B3033] mb-2">Message</h4>
                <div className="bg-white rounded-xl p-4 text-[#2B3033]/80 whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#2B3033]/10">
                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  data-testid="delete-submission-button"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="btn-primary"
                    data-testid="reply-button"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionsManager;
