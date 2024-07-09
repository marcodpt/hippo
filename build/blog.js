import plugin from '../plugins/blog/index.js'

export default ({
  plugin,  
  template: Deno.readTextFileSync('plugins/blog/index.html'),
  title: 'Blog',
  description: 'A simple plugin that can be used with any classless css framework.',
  url: 'https://marcodpt.github.io/hippo/blog/',
  dir: 'docs/blog',
  rss: true,
  settings: {
    nav: [
      {
        title: 'Home',
        url: 'https://marcodpt.github.io/hippo/blog'
      }, {
        title: 'Hippo',
        url: 'https://marcodpt.github.io/hippo'
      },
      {
        title: 'GitHub',
        url: 'https://github.com/marcodpt/hippo'
      },
      {
        title: 'Rss Feed',
        url: 'https://marcodpt.github.io/hippo/blog/rss.xml',
        last: true
      }
    ]
  }
})
