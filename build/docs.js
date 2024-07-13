import plugin from '../plugins/book/index.js'

export default ({
  plugin,  
  template: Deno.readTextFileSync('plugins/book/templates/bootstrap.html'),
  title: 'Hippo SSG',
  description: 'A SSG for Deno.',
  lang: 'en',
  url: '/hippo/docs/',
  dir: 'docs/docs',
  rss: true,
  settings: {
    email: 'user@mail.com',
    icons: [
      {
        title: 'Home Page',
        icon: 'fa-solid fa-house',
        url: 'https://marcodpt.github.io/hippo'
      },
      {
        title: 'GitHub',
        icon: 'fa-brands fa-github',
        url: 'https://github.com/marcodpt/hippo'
      },
      {
        title: 'Rss Feed',
        icon: 'fa-solid fa-square-rss',
        url: 'https://marcodpt.github.io/hippo/book/rss.xml'
      }
    ]
  }
})
