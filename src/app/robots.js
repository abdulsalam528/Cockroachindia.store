export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/api/'],
    },
    sitemap: 'https://cockroachindia.store/sitemap.xml',
  };
}
