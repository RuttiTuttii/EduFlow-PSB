import { useEffect } from 'react';

// SVG favicon для светлой темы (day) - с фиолетовым градиентом
const lightFaviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="55" stroke="url(#logoGradient)" stroke-width="4" fill="none"/>
  <circle cx="60" cy="60" r="45" stroke="url(#logoGradient)" stroke-width="2" fill="none" stroke-dasharray="10 5"/>
  <path d="M35 35 L35 80 C35 82 36 85 40 85 L80 85 C82 85 85 83 85 80 L85 35 Z" stroke="url(#logoGradient)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 35 L40 85 L80 85 L80 35 Z" fill="url(#logoGradient)" opacity="0.2"/>
  <line x1="60" y1="35" x2="60" y2="85" stroke="url(#logoGradient)" stroke-width="2"/>
  <line x1="45" y1="50" x2="75" y2="50" stroke="url(#logoGradient)" stroke-width="2" stroke-linecap="round"/>
  <line x1="45" y1="60" x2="75" y2="60" stroke="url(#logoGradient)" stroke-width="2" stroke-linecap="round"/>
  <line x1="45" y1="70" x2="75" y2="70" stroke="url(#logoGradient)" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

// SVG favicon для тёмной темы (night) - с более светлым/ярким градиентом
const darkFaviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="55" stroke="url(#logoGradient)" stroke-width="4" fill="none"/>
  <circle cx="60" cy="60" r="45" stroke="url(#logoGradient)" stroke-width="2" fill="none" stroke-dasharray="10 5"/>
  <path d="M35 35 L35 80 C35 82 36 85 40 85 L80 85 C82 85 85 83 85 80 L85 35 Z" stroke="url(#logoGradient)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 35 L40 85 L80 85 L80 35 Z" fill="url(#logoGradient)" opacity="0.3"/>
  <line x1="60" y1="35" x2="60" y2="85" stroke="url(#logoGradient)" stroke-width="2"/>
  <line x1="45" y1="50" x2="75" y2="50" stroke="url(#logoGradient)" stroke-width="2" stroke-linecap="round"/>
  <line x1="45" y1="60" x2="75" y2="60" stroke="url(#logoGradient)" stroke-width="2" stroke-linecap="round"/>
  <line x1="45" y1="70" x2="75" y2="70" stroke="url(#logoGradient)" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg.trim());
  return `data:image/svg+xml,${encoded}`;
}

function setFavicon(dataUrl: string) {
  // Удаляем существующие favicon
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => link.remove());

  // Создаём новый favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = dataUrl;
  document.head.appendChild(link);

  // Также добавляем для Apple устройств
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = dataUrl;
  document.head.appendChild(appleLink);
}

export function useDynamicFavicon(theme: 'day' | 'night') {
  useEffect(() => {
    const svg = theme === 'day' ? lightFaviconSvg : darkFaviconSvg;
    const dataUrl = svgToDataUrl(svg);
    setFavicon(dataUrl);
  }, [theme]);
}
