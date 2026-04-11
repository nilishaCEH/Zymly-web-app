import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NaturalFlavors = () => {
  const [flavors, setFlavors] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [content, setContent] = useState({});

  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        const response = await axios.get(`${API}/flavors/active`);
        setFlavors(response.data);
        if (response.data.length > 0) setSelectedFlavor(response.data[0]);
      } catch (error) {
        console.error('Error fetching flavors:', error);
      }
    };

    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API}/content/flavors`);
        const map = {};
        response.data.forEach(item => { map[item.section] = item; });
        setContent(map);
      } catch (error) {
        console.error('Error fetching flavors page content:', error);
      }
    };

    fetchFlavors();
    fetchContent();
  }, []);

  const accentColor = (flavor) => flavor?.accent_color || '#2B3033';

  return (
    <div className="min-h-screen bg-[#E0D8C8] pt-20" data-testid="flavors-page">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-[#C8A25F] font-medium mb-2 block">
              {content.hero?.subtitle || 'Our Collection'}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2B3033] tracking-tighter mb-6">
              {content.hero?.title || 'Natural Flavors'}
            </h1>
            <p className="text-lg text-[#2B3033]/70 leading-relaxed">
              {content.hero?.content || 'Each flavor is carefully crafted using the finest natural ingredients and traditional fermentation methods. Discover your perfect sip.'}
            </p>
          </motion.div>

          {/* Flavor Selector + Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Flavor Cards */}
            <div className="space-y-4">
              {flavors.map((flavor, index) => {
                const isSelected = selectedFlavor?.id === flavor.id;
                return (
                  <motion.div
                    key={flavor.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedFlavor(flavor)}
                    className="p-6 rounded-2xl cursor-pointer transition-all duration-300"
                    style={
                      isSelected
                        ? { backgroundColor: accentColor(flavor), color: '#E0D8C8' }
                        : { backgroundColor: '#F2EFE8', color: '#2B3033' }
                    }
                    data-testid={`flavor-selector-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex-shrink-0"
                        style={{ backgroundColor: flavor.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-xl font-bold">{flavor.name}</h3>
                          {flavor.tags && flavor.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={
                                isSelected
                                  ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#E0D8C8' }
                                  : { backgroundColor: `${flavor.color}25`, color: accentColor(flavor) }
                              }
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm opacity-70">{flavor.tagline}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Flavor Detail */}
            {selectedFlavor && (
              <motion.div
                key={selectedFlavor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-[#F2EFE8] rounded-3xl overflow-hidden"
                data-testid="flavor-detail"
              >
                <div
                  className="aspect-video relative"
                  style={{ background: `linear-gradient(135deg, ${selectedFlavor.color}40, ${selectedFlavor.color}10)` }}
                >
                  <img
                    src={selectedFlavor.image_url}
                    alt={selectedFlavor.name}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedFlavor.color }} />
                    {selectedFlavor.tags && selectedFlavor.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${selectedFlavor.color}25`, color: accentColor(selectedFlavor) }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl font-bold text-[#2B3033] mb-2">{selectedFlavor.name}</h2>
                  <p className="font-medium mb-4" style={{ color: accentColor(selectedFlavor) }}>{selectedFlavor.tagline}</p>
                  <p className="text-[#2B3033]/70 leading-relaxed mb-6">{selectedFlavor.description}</p>

                  {selectedFlavor.benefits && selectedFlavor.benefits.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[#2B3033] mb-3">Benefits</h4>
                      <ul className="space-y-2">
                        {selectedFlavor.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-3 text-[#2B3033]/80">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${selectedFlavor.color}30` }}
                            >
                              <Check size={12} style={{ color: accentColor(selectedFlavor) }} />
                            </div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* All Flavors Grid */}
      <section className="py-16 bg-[#F2EFE8]" data-testid="flavors-grid-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B3033] mb-8 text-center">
            {content.grid?.title || 'Explore All Flavors'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {flavors.map((flavor, index) => (
              <motion.div
                key={flavor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => { setSelectedFlavor(flavor); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="bg-white rounded-2xl overflow-hidden card-hover cursor-pointer"
                data-testid={`flavor-grid-card-${index}`}
              >
                <div
                  className="aspect-square relative"
                  style={{ background: `linear-gradient(180deg, ${flavor.color}30, transparent)` }}
                >
                  <img
                    src={flavor.image_url}
                    alt={flavor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: flavor.color }} />
                  <h3 className="font-bold text-[#2B3033]">{flavor.name}</h3>
                  <p className="text-xs text-[#2B3033]/60 mt-1">{flavor.tagline}</p>
                  {flavor.tags && flavor.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-2">
                      {flavor.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${flavor.color}20`, color: accentColor(flavor) }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NaturalFlavors;
