import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import axios from 'axios';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContentManager = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content`, { withCredentials: true });
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (item) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`${API}/content/${item.id}`, {
        title: item.title,
        subtitle: item.subtitle,
        content: item.content,
        image_url: item.image_url,
        cta_text: item.cta_text,
        cta_link: item.cta_link
      }, { withCredentials: true });
      setMessage({ type: 'success', text: 'Content updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update content' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (id, field, value) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const pages = ['home', 'mission', 'about', 'contact', 'flavors'];

  const getPageContent = (pageName) => content.filter(c => c.page_name === pageName);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E0D8C8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C8A25F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0D8C8]" data-testid="content-manager-page">
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
              <h1 className="text-2xl font-bold text-[#2B3033]">Page Content</h1>
              <p className="text-[#2B3033]/60 text-sm">Edit content for all pages</p>
            </div>
          </div>

          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#F2EFE8] p-1 rounded-lg">
              {pages.map(page => (
                <TabsTrigger
                  key={page}
                  value={page}
                  className="capitalize data-[state=active]:bg-[#2B3033] data-[state=active]:text-[#E0D8C8]"
                  data-testid={`tab-${page}`}
                >
                  {page === 'flavors' ? 'Natural Flavors' : page}
                </TabsTrigger>
              ))}
            </TabsList>

            {pages.map(page => (
              <TabsContent key={page} value={page} className="space-y-6">
                {getPageContent(page).length === 0 ? (
                  <div className="bg-[#F2EFE8] rounded-xl p-8 text-center">
                    <FileText className="w-12 h-12 text-[#2B3033]/30 mx-auto mb-4" />
                    <p className="text-[#2B3033]/60">No content sections for this page yet.</p>
                  </div>
                ) : (
                  getPageContent(page).map(item => (
                    <div
                      key={item.id}
                      className="bg-[#F2EFE8] rounded-xl p-6 border border-[#2B3033]/10"
                      data-testid={`content-section-${item.section}`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[#2B3033] capitalize">
                          {item.section} Section
                        </h3>
                        <button
                          onClick={() => handleUpdate(item)}
                          disabled={saving}
                          className="btn-primary text-sm flex items-center gap-2"
                          data-testid={`save-${item.section}`}
                        >
                          <Save size={16} />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {item.title !== undefined && (
                          <div>
                            <Label className="text-[#2B3033]">Title</Label>
                            <Input
                              value={item.title || ''}
                              onChange={(e) => updateField(item.id, 'title', e.target.value)}
                              className="mt-2 bg-white border-[#2B3033]/20"
                              data-testid={`input-title-${item.section}`}
                            />
                          </div>
                        )}

                        {item.subtitle !== undefined && (
                          <div>
                            <Label className="text-[#2B3033]">Subtitle</Label>
                            <Input
                              value={item.subtitle || ''}
                              onChange={(e) => updateField(item.id, 'subtitle', e.target.value)}
                              className="mt-2 bg-white border-[#2B3033]/20"
                              data-testid={`input-subtitle-${item.section}`}
                            />
                          </div>
                        )}

                        {item.image_url !== undefined && (
                          <div className="md:col-span-2">
                            <Label className="text-[#2B3033]">Image URL</Label>
                            <Input
                              value={item.image_url || ''}
                              onChange={(e) => updateField(item.id, 'image_url', e.target.value)}
                              className="mt-2 bg-white border-[#2B3033]/20"
                              data-testid={`input-image-${item.section}`}
                            />
                            {item.image_url && (
                              <img src={item.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                            )}
                          </div>
                        )}

                        {item.content !== undefined && (
                          <div className="md:col-span-2">
                            <Label className="text-[#2B3033]">Content</Label>
                            <Textarea
                              value={item.content || ''}
                              onChange={(e) => updateField(item.id, 'content', e.target.value)}
                              rows={5}
                              className="mt-2 bg-white border-[#2B3033]/20 resize-none"
                              data-testid={`input-content-${item.section}`}
                            />
                          </div>
                        )}

                        {item.cta_text !== undefined && (
                          <div>
                            <Label className="text-[#2B3033]">CTA Text</Label>
                            <Input
                              value={item.cta_text || ''}
                              onChange={(e) => updateField(item.id, 'cta_text', e.target.value)}
                              className="mt-2 bg-white border-[#2B3033]/20"
                              data-testid={`input-cta-text-${item.section}`}
                            />
                          </div>
                        )}

                        {item.cta_link !== undefined && (
                          <div>
                            <Label className="text-[#2B3033]">CTA Link</Label>
                            <Input
                              value={item.cta_link || ''}
                              onChange={(e) => updateField(item.id, 'cta_link', e.target.value)}
                              className="mt-2 bg-white border-[#2B3033]/20"
                              data-testid={`input-cta-link-${item.section}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ContentManager;
