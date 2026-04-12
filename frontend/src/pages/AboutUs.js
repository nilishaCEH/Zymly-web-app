import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AboutUs = () => {
  const [content, setContent] = useState({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API}/content/about`);
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

  return (
    <div className="min-h-screen bg-[#E0D8C8] pt-20" data-testid="about-page">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-[#C8A25F] font-medium mb-4 block">Who We Are</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2B3033] tracking-tighter mb-6">
                {content.story?.title || 'Our Story'}
              </h1>
              <p className="text-xl text-[#2B3033]/70 mb-6">
                {content.story?.subtitle || 'From Kitchen Experiments to Your Glass'}
              </p>
              <p className="text-lg text-[#2B3033]/80 leading-relaxed">
                {content.story?.content || `Zymly started as a passion project in a small kitchen, where the love for traditional fermentation met modern health consciousness. What began as making probiotic drinks for friends and family has grown into a mission to share the goodness of naturally fermented beverages with everyone.`}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden">
                <img
                  src={content.story?.image_url || "https://images.unsplash.com/photo-1683912568493-9a6a94aacfe3"}
                  alt="Zymly Team"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#C8A25F] rounded-2xl flex items-center justify-center">
                <img
                  src="/zymly-logo.png"
                  alt="Zymly"
                  className="w-20 h-20 object-contain"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[#F2EFE8]" data-testid="team-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2B3033] tracking-tight mb-6">
              {content.team?.title || 'The Team'}
            </h2>
            <p className="text-lg text-[#2B3033]/70 leading-relaxed">
              {content.team?.content || `We're a small but dedicated team of health enthusiasts, fermentation geeks, and flavor artists. Every bottle of Zymly is crafted with the same care and attention as the very first batch.`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20" data-testid="journey-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2B3033] tracking-tight mb-4">
              Our Journey
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'The Beginning', desc: 'Started experimenting with fermentation in our kitchen' },
              { step: '02', title: 'First Batch', desc: 'Perfected our signature Simply Lemon flavor' },
              { step: '03', title: 'Growing Family', desc: 'Expanded to 5 unique natural flavors' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
                data-testid={`journey-step-${index}`}
              >
                <span className="text-8xl font-black text-[#C8A25F]/20 absolute -top-4 -left-2">
                  {item.step}
                </span>
                <div className="relative z-10 pt-12">
                  <h3 className="text-xl font-bold text-[#2B3033] mb-3">{item.title}</h3>
                  <p className="text-[#2B3033]/70">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-20 bg-[#2B3033]" data-testid="brand-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="/zymly-logo.png"
                alt="Zymly Brand"
                className="w-full max-w-md mx-auto"
                style={{ filter: 'drop-shadow(0 6px 20px rgba(0, 0, 0, 0.55))' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#E0D8C8] tracking-tight mb-6">
                What Zymly Stands For
              </h2>
              <ul className="space-y-4">
                {[
                  'Homemade with love and care',
                  '100% Vegan ingredients',
                  'Handcrafted traditional methods',
                  'Good for your gut health',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4 text-[#E0D8C8]/80">
                    <div className="w-2 h-2 rounded-full bg-[#C8A25F]"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
