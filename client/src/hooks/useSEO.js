// src/hooks/useSEO.js
import { useEffect } from 'react';

export const useSEO = ({ title, description, image, url } = {}) => {
  useEffect(() => {
    document.title = title
      ? `${title} | AutoNexus`
      : 'AutoNexus | AI-Powered Car Dealership in Nairobi';

    const setMeta = (name, content, prop = false) => {
      if (!content) return;
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    const desc = description || 'Browse hundreds of verified vehicles. AI-powered search, price predictions, virtual test drives. Find your perfect car in Nairobi, Kenya.';
    const img = image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80';
    const pageUrl = url || window.location.href;

    setMeta('description', desc);
    setMeta('keywords', 'car dealership nairobi, buy car kenya, used cars nairobi, AI car search, autonexus');

    // Open Graph — WhatsApp/Facebook link previews
    setMeta('og:title', document.title, true);
    setMeta('og:description', desc, true);
    setMeta('og:image', img, true);
    setMeta('og:url', pageUrl, true);
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', 'AutoNexus', true);

    // Twitter card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', document.title);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);
  }, [title, description, image, url]);
};
