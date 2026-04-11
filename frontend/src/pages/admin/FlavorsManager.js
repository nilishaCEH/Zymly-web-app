import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, GripVertical } from 'lucide-react';
import axios from 'axios';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FlavorsManager = () => {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const emptyFlavor = {
    name: '',
    tagline: '',
    description: '',
    image_url: '',
    color: '#C8A25F',
    accent_color: '#2B3033',
    benefits: [],
    tags: [],
    order: 0,
    is_active: true
  };

  const [formData, setFormData] = useState(emptyFlavor);
  const [benefitInput, setBenefitInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchFlavors();
  }, []);

  const fetchFlavors = async () => {
    try {
      const response = await axios.get(`${API}/flavors`, { withCredentials: true });
      setFlavors(response.data);
    } catch (error) {
      console.error('Error fetching flavors:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (flavor = null) => {
    if (flavor) {
      setEditingFlavor(flavor);
      setFormData({
        name: flavor.name,
        tagline: flavor.tagline,
        description: flavor.description,
        image_url: flavor.image_url,
        color: flavor.color,
        accent_color: flavor.accent_color || '#2B3033',
        benefits: flavor.benefits || [],
        tags: flavor.tags || [],
        order: flavor.order,
        is_active: flavor.is_active
      });
    } else {
      setEditingFlavor(null);
      setFormData({ ...emptyFlavor, order: flavors.length + 1 });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFlavor(null);
    setFormData(emptyFlavor);
    setBenefitInput('');
    setTagInput('');
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData(prev => ({ ...prev, benefits: [...prev.benefits, benefitInput.trim()] }));
      setBenefitInput('');
    }
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingFlavor) {
        await axios.put(`${API}/flavors/${editingFlavor.id}`, formData, { withCredentials: true });
        setMessage({ type: 'success', text: 'Flavor updated successfully!' });
      } else {
        await axios.post(`${API}/flavors`, formData, { withCredentials: true });
        setMessage({ type: 'success', text: 'Flavor created successfully!' });
      }
      fetchFlavors();
      closeModal();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save flavor' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flavor?')) return;
    try {
      await axios.delete(`${API}/flavors/${id}`, { withCredentials: true });
      fetchFlavors();
      setMessage({ type: 'success', text: 'Flavor deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete flavor' });
    }
  };

  const toggleActive = async (flavor) => {
    try {
      await axios.put(`${API}/flavors/${flavor.id}`, { is_active: !flavor.is_active }, { withCredentials: true });
      fetchFlavors();
    } catch (error) {
      console.error('Error toggling flavor:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E0D8C8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C8A25F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0D8C8]" data-testid="flavors-manager-page">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/dashboard"
                className="w-10 h-10 rounded-full bg-[#F2EFE8] flex items-center justify-center hover:bg-[#2B3033] hover:text-[#E0D8C8] transition-colors"
                data-testid="back-to-dashboard"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#2B3033]">Flavors</h1>
                <p className="text-[#2B3033]/60 text-sm">Manage your product flavors</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="btn-primary flex items-center gap-2"
              data-testid="add-flavor-button"
            >
              <Plus size={18} />
              Add Flavor
            </button>
          </div>

          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {/* Flavors List */}
          <div className="space-y-4">
            {flavors.map((flavor, index) => (
              <div
                key={flavor.id}
                className="bg-[#F2EFE8] rounded-xl p-4 border border-[#2B3033]/10 flex items-center gap-4"
                data-testid={`flavor-item-${index}`}
              >
                <div className="text-[#2B3033]/30 cursor-grab">
                  <GripVertical size={20} />
                </div>

                <div
                  className="w-12 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: flavor.color }}
                ></div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[#2B3033]">{flavor.name}</h3>
                    {flavor.tags && flavor.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${flavor.color}25`, color: flavor.accent_color || flavor.color }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-[#2B3033]/60 truncate">{flavor.tagline}</p>
                </div>

                {/* Color swatches preview */}
                <div className="hidden sm:flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: flavor.color }} title="Flavor color"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: flavor.accent_color || '#2B3033' }} title="Accent color"></div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#2B3033]/60">Active</span>
                    <Switch
                      checked={flavor.is_active}
                      onCheckedChange={() => toggleActive(flavor)}
                      data-testid={`toggle-active-${index}`}
                    />
                  </div>

                  <button
                    onClick={() => openModal(flavor)}
                    className="w-9 h-9 rounded-lg bg-[#2B3033]/10 flex items-center justify-center hover:bg-[#C8A25F] hover:text-white transition-colors"
                    data-testid={`edit-flavor-${index}`}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(flavor.id)}
                    className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-red-500"
                    data-testid={`delete-flavor-${index}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl bg-[#F2EFE8] border-[#2B3033]/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2B3033]">
              {editingFlavor ? 'Edit Flavor' : 'Add New Flavor'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="flavor-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Name */}
              <div>
                <Label className="text-[#2B3033]">Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 bg-white border-[#2B3033]/20"
                  data-testid="flavor-name-input"
                />
              </div>

              {/* Tagline */}
              <div>
                <Label className="text-[#2B3033]">Tagline *</Label>
                <Input
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="mt-2 bg-white border-[#2B3033]/20"
                  data-testid="flavor-tagline-input"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Label className="text-[#2B3033]">Description *</Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-2 bg-white border-[#2B3033]/20 resize-none"
                  data-testid="flavor-description-input"
                />
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <Label className="text-[#2B3033]">Image URL *</Label>
                <Input
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="mt-2 bg-white border-[#2B3033]/20"
                  data-testid="flavor-image-input"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-lg" />
                )}
              </div>

              {/* Flavor Color */}
              <div>
                <Label className="text-[#2B3033]">Flavor Color</Label>
                <p className="text-xs text-[#2B3033]/50 mb-2">Used for the color dot and gradient</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                    data-testid="flavor-color-input"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 bg-white border-[#2B3033]/20"
                    placeholder="#C8A25F"
                  />
                </div>
              </div>

              {/* Accent / Button Event Color */}
              <div>
                <Label className="text-[#2B3033]">Accent Color</Label>
                <p className="text-xs text-[#2B3033]/50 mb-2">Selected card highlight & tag color</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                    data-testid="flavor-accent-color-input"
                  />
                  <Input
                    value={formData.accent_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="flex-1 bg-white border-[#2B3033]/20"
                    placeholder="#2B3033"
                  />
                </div>
                {/* Live preview of selected card */}
                <div
                  className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: formData.accent_color || '#2B3033', color: '#E0D8C8' }}
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: formData.color }}></div>
                  <span>Selected card preview</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="md:col-span-2">
                <Label className="text-[#2B3033]">Benefits</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    placeholder="Add a benefit..."
                    className="flex-1 bg-white border-[#2B3033]/20"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    data-testid="benefit-input"
                  />
                  <button type="button" onClick={addBenefit} className="btn-secondary px-4" data-testid="add-benefit-button">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.benefits.map((benefit, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-[#2B3033] text-[#E0D8C8] rounded-full text-sm">
                      {benefit}
                      <button type="button" onClick={() => removeBenefit(index)}><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <Label className="text-[#2B3033]">Tags</Label>
                <p className="text-xs text-[#2B3033]/50 mb-2">Short labels shown on the flavor grid cards (e.g. Bestseller, New, Spicy)</p>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1 bg-white border-[#2B3033]/20"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    data-testid="tag-input"
                  />
                  <button type="button" onClick={addTag} className="btn-secondary px-4" data-testid="add-tag-button">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: `${formData.color}25`, color: formData.accent_color || '#2B3033' }}
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(index)}><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Order & Active */}
              <div>
                <Label className="text-[#2B3033]">Order</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="mt-2 bg-white border-[#2B3033]/20"
                  data-testid="flavor-order-input"
                />
              </div>

              <div className="flex items-center gap-3 mt-8">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  data-testid="flavor-active-switch"
                />
                <Label className="text-[#2B3033]">Active (visible on website)</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#2B3033]/10">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2 rounded-lg border border-[#2B3033]/20 text-[#2B3033] hover:bg-[#2B3033]/10 transition-colors"
                data-testid="cancel-flavor-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2"
                data-testid="save-flavor-button"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Flavor'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlavorsManager;
