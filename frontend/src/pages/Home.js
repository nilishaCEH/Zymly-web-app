import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Heart, Sparkles, ChefHat } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const [content, setContent] = useState({});
  const [flavors, setFlavors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, flavorsRes] = await Promise.all([
          axios.get(`${API}/content/home`),
          axios.get(`${API}/flavors/active`)
        ]);
        
        const contentMap = {};
        contentRes.data.forEach(item => {
          contentMap[item.section] = item;
        });
        setContent(contentMap);
        setFlavors(flavorsRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: ChefHat, title: 'Homemade', desc: 'Crafted with care in small batches' },
    { icon: Leaf, title: '100% Vegan', desc: 'Plant-based goodness only' },
    { icon: Sparkles, title: 'Handcrafted', desc: 'Traditional fermentation methods' },
    { icon: Heart, title: 'Gut Health', desc: 'Probiotics for your wellbeing' },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img
            src="/banner_1.jpg"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2B3033]/90 via-[#2B3033]/70 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-[#C8A25F]/20 text-[#C8A25F] rounded-full text-sm font-medium mb-6">
                Probiotic Fizzy Beverage
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#E0D8C8] tracking-tighter leading-tight mb-6">
                {content.hero?.title || 'Naturally Fermented Goodness'}
              </h1>
              <p className="text-lg sm:text-xl text-[#E0D8C8]/80 leading-relaxed mb-8">
                {content.hero?.content || 'Handcrafted with love, our probiotic drinks bring you the perfect blend of taste and health.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/flavors"
                  className="btn-primary inline-flex items-center gap-2"
                  data-testid="hero-cta-primary"
                >
                  {content.hero?.cta_text || 'Explore Flavors'}
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/about"
                  className="px-6 py-3 rounded-full font-semibold border-2 border-[#E0D8C8]/30 text-[#E0D8C8] hover:bg-[#E0D8C8]/10 transition-all"
                  data-testid="hero-cta-secondary"
                >
                  Our Story
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#E0D8C8]" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2B3033] tracking-tight mb-4">
              {content.features?.title || 'Why Zymly?'}
            </h2>
            <p className="text-[#2B3033]/70 max-w-2xl mx-auto">
              {content.features?.content || 'Homemade with care, 100% vegan ingredients, handcrafted flavors, and probiotics for optimal gut health.'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F2EFE8] rounded-2xl p-8 text-center card-hover"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-16 h-16 rounded-full bg-[#C8A25F]/20 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-[#C8A25F]" />
                </div>
                <h3 className="text-xl font-bold text-[#2B3033] mb-2">{feature.title}</h3>
                <p className="text-[#2B3033]/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Flavors */}
      <section className="py-20 bg-[#F2EFE8]" data-testid="featured-flavors-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
          >
            <div>
              <span className="text-[#C8A25F] font-medium mb-2 block">Taste the Goodness</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2B3033] tracking-tight">
                Our Natural Flavors
              </h2>
            </div>
            <Link
              to="/flavors"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-[#2B3033] hover:text-[#C8A25F] font-medium transition-colors"
              data-testid="view-all-flavors"
            >
              View All Flavors
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {flavors.map((flavor, index) => (
              <motion.div
                key={flavor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-3xl bg-white card-hover"
                data-testid={`flavor-card-${index}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={flavor.image_url}
                    alt={flavor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 p-6"
                  style={{ background: `linear-gradient(to top, ${flavor.color}ee, transparent)` }}
                >
                  <h3 className="text-2xl font-bold text-white mb-1">{flavor.name}</h3>
                  <p className="text-white/80">{flavor.tagline}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#E0D8C8]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B3033] tracking-tighter mb-6">
              Ready to Feel Good?
            </h2>
            <p className="text-lg text-[#2B3033]/65 mb-8 max-w-2xl mx-auto">
              Join the Zymly family and discover the joy of naturally fermented goodness. Your gut will thank you!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="btn-primary inline-flex items-center gap-2"
                data-testid="cta-contact"
              >
                Get in Touch
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://www.instagram.com/go_zymly"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full font-semibold border-2 border-[#2B3033]/30 text-[#2B3033] hover:bg-[#2B3033]/10 transition-all"
                data-testid="cta-instagram"
              >
                Follow on Instagram
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
