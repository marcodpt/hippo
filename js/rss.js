export default ({title, description, url}, Posts) => 
`<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>${title}</title>
    <description>${description || ''}</description>
    <link>${url}</link>
  </channel>${Posts
    .filter(({main, date}) => date && main.textContent.trim())
    .map(({title, main, path}) => `
  <item>
    <title>${title}</title>
    <description>${main.innerHTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;')}</description>
    <link>${url+path}</link>
    <guid isPermaLink="false">${url+path}</guid>
  </item>
`).join('')}</rss>`
