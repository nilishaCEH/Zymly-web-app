import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, Palette, Mail, LogOut, Menu, X, ChevronRight,
  Home, Target, Users, Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ flavors: 0, submissions: 0, unread: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [flavorsRes, submissionsRes] = await Promise.all([
          axios.get(`${API}/flavors`, { withCredentials: true }),
          axios.get(`${API}/submissions`, { withCredentials: true })
        ]);
        setStats({
          flavors: flavorsRes.data.length,
          submissions: submissionsRes.data.length,
          unread: submissionsRes.data.filter(s => !s.is_read).length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/content', label: 'Page Content', icon: FileText },
    { path: '/admin/flavors', label: 'Flavors', icon: Palette },
    { path: '/admin/submissions', label: 'Contact Submissions', icon: Mail, badge: stats.unread },
  ];

  const pageLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/flavors', label: 'Natural Flavors', icon: Palette },
    { path: '/mission', label: 'Our Mission', icon: Target },
    { path: '/about', label: 'About Us', icon: Users },
    { path: '/contact', label: 'Contact Us', icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#E0D8C8]" data-testid="admin-dashboard">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#2B3033] px-4 py-3 flex items-center justify-between">
        <img
          src="/zymly-logo.png"
          alt="Zymly"
          className="h-8"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45))' }}
        />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#E0D8C8]" data-testid="mobile-sidebar-toggle">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#2B3033] transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          data-testid="admin-sidebar"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 hidden lg:block">
              <img
                src="/zymly-logo.png"
                alt="Zymly"
                className="h-12"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45))' }}
              />
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              <p className="px-3 text-xs font-semibold text-[#E0D8C8]/50 uppercase tracking-wider mb-4">
                CMS
              </p>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#C8A25F] text-white'
                      : 'text-[#E0D8C8]/70 hover:bg-[#E0D8C8]/10 hover:text-[#E0D8C8]'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="border-t border-[#E0D8C8]/10 my-6"></div>

              <p className="px-3 text-xs font-semibold text-[#E0D8C8]/50 uppercase tracking-wider mb-4">
                View Pages
              </p>
              {pageLinks.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-[#E0D8C8]/70 hover:bg-[#E0D8C8]/10 hover:text-[#E0D8C8] rounded-lg transition-colors"
                  data-testid={`page-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-sm">{item.label}</span>
                  <ChevronRight size={14} />
                </a>
              ))}
            </nav>

            <div className="p-4 border-t border-[#E0D8C8]/10">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#C8A25F] flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#E0D8C8] text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-[#E0D8C8]/50 text-xs truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#E0D8C8]/70 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                data-testid="logout-button"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:min-h-0">
          <div className="p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-[#2B3033] mb-2">Dashboard</h1>
              <p className="text-[#2B3033]/60 mb-8">Welcome back, {user?.name}!</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#F2EFE8] rounded-xl p-6 border border-[#2B3033]/10" data-testid="stat-flavors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C8A25F]/20 flex items-center justify-center">
                      <Palette className="w-6 h-6 text-[#C8A25F]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-[#2B3033]">{stats.flavors}</p>
                      <p className="text-[#2B3033]/60 text-sm">Flavors</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F2EFE8] rounded-xl p-6 border border-[#2B3033]/10" data-testid="stat-submissions">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C8A25F]/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-[#C8A25F]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-[#2B3033]">{stats.submissions}</p>
                      <p className="text-[#2B3033]/60 text-sm">Submissions</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F2EFE8] rounded-xl p-6 border border-[#2B3033]/10" data-testid="stat-unread">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-[#2B3033]">{stats.unread}</p>
                      <p className="text-[#2B3033]/60 text-sm">Unread</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <h2 className="text-xl font-bold text-[#2B3033] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/admin/content"
                  className="bg-[#F2EFE8] rounded-xl p-6 border border-[#2B3033]/10 hover:border-[#C8A25F] transition-colors group"
                  data-testid="quick-action-content"
                >
                  <FileText className="w-8 h-8 text-[#C8A25F] mb-3" />
                  <h3 className="font-bold text-[#2B3033] group-hover:text-[#C8A25F] transition-colors">
                    Edit Page Content
                  </h3>
                  <p className="text-sm text-[#2B3033]/60 mt-1">Update text and images</p>
                </Link>

                <Link
                  to="/admin/flavors"
                  className="bg-[#F2EFE8] rounded-xl p-6 border border-[#2B3033]/10 hover:border-[#C8A25F] transition-colors group"
                  data-testid="quick-action-flavors"
                >
                  <Palette className="w-8 h-8 text-[#C8A25F] mb-3" />
                  <h3 className="font-bold text-[#2B3033] group-hover:text-[#C8A25F] transition-colors">
                    Manage Flavors
                  </h3>
                  <p className="text-sm text-[#2B3033]/60 mt-1">Add or edit products</p>
                </Link>

                <Link
                  to="/admin/submissions"
                  className="bg-[#F2EFE8] rounded-xl p-6 border border-[#2B3033]/10 hover:border-[#C8A25F] transition-colors group"
                  data-testid="quick-action-submissions"
                >
                  <Mail className="w-8 h-8 text-[#C8A25F] mb-3" />
                  <h3 className="font-bold text-[#2B3033] group-hover:text-[#C8A25F] transition-colors">
                    View Messages
                  </h3>
                  <p className="text-sm text-[#2B3033]/60 mt-1">Check contact submissions</p>
                </Link>

                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#2B3033] rounded-xl p-6 hover:bg-[#1A1D1F] transition-colors group"
                  data-testid="quick-action-preview"
                >
                  <Home className="w-8 h-8 text-[#C8A25F] mb-3" />
                  <h3 className="font-bold text-[#E0D8C8]">
                    Preview Website
                  </h3>
                  <p className="text-sm text-[#E0D8C8]/60 mt-1">Open in new tab</p>
                </a>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
