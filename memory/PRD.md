# Zymly Portfolio Web Application - PRD

## Project Overview
Zymly is a portfolio web application for a probiotic fizzy beverage brand. The application showcases the brand's products, mission, and allows customers to contact the business.

## Original Problem Statement
Build a Portfolio Web application for "Zymly" brand that sells naturally produced probiotic beverages. The app should be:
- Mobile Responsive and highly attractive
- GenZ vibe, energetic and enthusiastic yet health-focused
- All pages fully customizable from backend CMS
- CMS with minimal but optimized and interactive UI

## User Personas
1. **Website Visitors**: Health-conscious individuals, GenZ audience looking for natural probiotic drinks
2. **Admin Users**: Zymly team members who manage website content

## Core Requirements (Static)
- Brand Colors: Dark Charcoal (#2B3033), Gold (#C8A25F), Cream (#E0D8C8)
- 5 Flavors: Simply Lemon, Ginger Lemon, Cinne Pineapple, Tangy Orange, Berry Bliss
- Contact email: contactus@zymly.in
- Instagram integration

## What's Been Implemented (January 2026)

### Public Pages
- **Home**: Hero section with brand messaging, features (Homemade, Vegan, Handcrafted, Gut Health), featured flavors grid, CTA section
- **Natural Flavors**: Interactive flavor selector with detailed descriptions, benefits, and images
- **Our Mission**: Mission statement, values section, impact statistics
- **About Us**: Brand story, team section, journey timeline
- **Contact Us**: Contact form with email integration via Resend

### Admin CMS
- **Dashboard**: Stats overview (flavors, submissions, unread), quick actions
- **Content Manager**: Edit text, images, CTAs for all pages with tabs for each page
- **Flavors Manager**: CRUD operations for flavors with color picker, benefits, order, active toggle
- **Submissions Manager**: View and manage contact form submissions, mark as read, delete

### Backend API
- FastAPI with MongoDB
- JWT authentication for admin
- Resend email integration for contact form notifications
- CRUD endpoints for content, flavors, and submissions

### Technical Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn UI components
- Backend: FastAPI, Motor (async MongoDB), PyJWT, bcrypt
- Database: MongoDB
- Email: Resend API

## Prioritized Backlog

### P0 (Critical)
- ✅ All pages implemented
- ✅ CMS fully functional
- ✅ Contact form with email

### P1 (Important)
- Product ordering/e-commerce integration
- Customer testimonials section
- Blog/News section

### P2 (Nice to have)
- Newsletter subscription
- Analytics dashboard in CMS
- Multi-language support
- SEO optimization

## Next Tasks
1. Add more product images specific to each flavor
2. Implement ordering/inquiry functionality
3. Add customer testimonials carousel
4. Social media feed integration
