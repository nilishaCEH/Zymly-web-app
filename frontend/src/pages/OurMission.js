import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Leaf, Users, Shield } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const OurMission = () => {
  const [content, setContent] = useState({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API}/content/mission`);
        const contentMap = {};
        response.data.forEach(item => {
          contentMap[item.section] = item;
        });
        setContent(contentMap);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
    fetchContent();
  }, []);

  const values = [
    { icon: Target, title: 'Quality First', desc: 'We never compromise on ingredients or process' },
    { icon: Leaf, title: 'Sustainability', desc: 'Eco-friendly packaging and responsible sourcing' },
    { icon: Users, title: 'Community', desc: 'Supporting local farmers and suppliers' },
    { icon: Shield, title: 'Transparency', desc: 'What you see is what you get - no hidden ingredients' },
  ];

  return (
    <div className="min-h-screen bg-[#E0D8C8] pt-20" data-testid="mission-page">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="text-[#C8A25F] font-medium mb-4 block">Why We Do What We Do</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2B3033] tracking-tighter mb-8">
              {content.main?.title || 'Our Mission'}
            </h1>
            <p className="text-xl sm:text-2xl text-[#2B3033]/70 leading-relaxed">
              {content.main?.subtitle || 'Bringing Health to Every Sip'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-[#F2EFE8]" data-testid="mission-content-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-[#2B3033]/80 leading-relaxed whitespace-pre-line">
                  {content.main?.content || `At Zymly, we believe that good health starts in the gut. Our mission is to make naturally fermented probiotic beverages accessible to everyone, without compromising on taste or quality.

We're committed to using only the finest natural ingredients, traditional fermentation methods, and sustainable practices to create drinks that nourish your body and delight your taste buds.`}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden bg-[#2B3033]">
                <img
                  src="https://images.pexels.com/photos/8475719/pexels-photo-8475719.jpeg"
                  alt="Zymly Mission"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-[#C8A25F] rounded-2xl p-6 text-white max-w-xs">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-white/80">Natural Ingredients</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20" data-testid="values-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2B3033] tracking-tight mb-4">
              {content.values?.title || 'Our Values'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
                data-testid={`value-card-${index}`}
              >
                <div className="w-20 h-20 rounded-full bg-[#2B3033] flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-10 h-10 text-[#C8A25F]" />
                </div>
                <h3 className="text-xl font-bold text-[#2B3033] mb-3">{value.title}</h3>
                <p className="text-[#2B3033]/70">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-[#2B3033]" data-testid="impact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-5xl font-black text-[#C8A25F] mb-2">5</p>
              <p className="text-[#E0D8C8]">Unique Flavors</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-5xl font-black text-[#C8A25F] mb-2">100%</p>
              <p className="text-[#E0D8C8]">Vegan & Natural</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-5xl font-black text-[#C8A25F] mb-2">∞</p>
              <p className="text-[#E0D8C8]">Love for Gut Health</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurMission;
