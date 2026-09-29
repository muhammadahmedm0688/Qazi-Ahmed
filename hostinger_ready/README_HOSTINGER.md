# Readora Online Bookstore - Hostinger Deployment Guide

This folder contains the complete, production-ready website for **Readora**, an online bookstore and curated literary marketplace.

## Quick Hostinger Deployment (1-Minute Upload)

### Method A: Hostinger File Manager (Recommended)
1. Log into your **Hostinger hPanel** dashboard.
2. Navigate to **Websites** &rarr; Select your domain &rarr; Click **File Manager**.
3. Open the `public_html` directory of your website.
4. Upload all files from the `hostinger_ready/public_html/` folder:
   - `index.html`
   - `style.css`
   - `app.js`
   - `data.js`
   - `.htaccess`
   - `images/` directory (with all bookstore images)
5. Visit your domain name (e.g. `https://yourdomain.com`). Your Readora bookstore is immediately live!

---

### Method B: FTP / SFTP Upload (FileZilla / Cyberduck)
1. In Hostinger hPanel, look up your **FTP Accounts** credentials (Host, Username, Port 21).
2. Connect using FileZilla or your preferred FTP client.
3. Drag and drop the contents of `hostinger_ready/public_html/` into `/public_html/`.

---

## Features Included in this Build
- **100% Client-Ready Static E-Commerce**: No backend database setup required; works immediately out of the box with local storage persistence.
- **Real-Time Deals Countdown Timer**: Automatically ticks down every second with urgency design.
- **Interactive Shopping Cart Drawer**: Add to cart, quantity adjusters (+/-), delete item, dynamic subtotal calculation, checkout modal.
- **Wishlist Drawer**: Save favorite titles with instant toggle feedback.
- **Category & Search Filtering**: Filter by 12 book genres or live search by title, author, or ISBN.
- **Quick View Modal**: Deep dive into publication specs, synopsis, author info, and reviews.
- **Interactive Newsletter**: Front-end email validation with instant coupon code reward state.
- **High-Performance Architecture**: Zero heavy framework overhead; fast Google Lighthouse scores with optimized `.htaccess` caching.
