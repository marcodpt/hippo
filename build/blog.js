import plugin from '../plugins/blog/index.js'

export default ({
  plugin,  
  template: Deno.readTextFileSync('plugins/blog/index.html'),
  title: 'Blog',
  url: 'https://marcodpt.github.io/hippo/blog/',
  dir: 'docs/blog',
  global: {
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
        url: 'https://www.rssboard.org/',
        last: true
      }
    ]
  }
})
