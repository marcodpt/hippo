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
        href: 'javascript:setTheme(\'https://unpkg.com/mvp.css\')',
        title: 'MVP.css'
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
        href: 'javascript:setTheme(\'https://unpkg.com/marx-css/css/marx.min.css\')',
        title: 'Marx'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/gh/yegor256/tacit@gh-pages/tacit-css.min.css\')',
        title: 'Tacit'
      }, {
        href: 'javascript:setTheme(\'https://cdn.simplecss.org/simple.css\')',
        title: 'Simple'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css\')',
        title: 'Pico.css'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css\')',
        title: 'Pure'
      }, {
        href: 'javascript:setTheme(\'https://unpkg.com/chota\')',
        title: 'Chota'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/picnic@7.1.0/picnic.min.css\')',
        title: 'Picnic'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\')',
        title: 'Bootstrap'
      }, {
        href: 'javascript:setTheme(\'https://cdn.jsdelivr.net/npm/bulma@1.0.1/css/bulma.min.css\')',
        title: 'Bulma'
      }
    ]
  }
})
