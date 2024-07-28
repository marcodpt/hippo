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
    style: '',
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
    ],
    themes: [
      {
        href: 'javascript:setTheme(\'\')',
        title: 'Browser Default'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/water.css@2/out/light.css\')',
        title: 'Water Css Light'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css\')',
        title: 'Water Css Dark'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/sakura.css/css/sakura.css\')',
        title: 'Sakura Default'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/sakura.css/css/sakura-earthly.css\')',
        title: 'Sakura Earthly'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/sakura.css/css/sakura-vader.css\')',
        title: 'Sakura Vader'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/sakura.css/css/sakura-dark.css\')',
        title: 'Sakura Dark'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/gh/yegor256/tacit@gh-pages/tacit-css.min.css\')',
        title: 'Tacit'
      }, {
        href: 'javascript:setTheme(\'https://cdn.simplecss.org/simple.css\')',
        title: 'Simple'
      }
    ],
    copyright: 'Made with ❤️ with Hippo SSG'
  }
})
