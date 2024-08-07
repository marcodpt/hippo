import plugin from '../plugins/newspaper/index.js'

export default ({
  plugin,  
  template: Deno.readTextFileSync('plugins/newspaper/templates/bootstrap.html'),
  title: 'Newspaper',
  description: 'A robust plugin for newspapers, magazines and blogs.',
  url: 'https://marcodpt.github.io/hippo/newspaper/',
  dir: 'docs/newspaper',
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
        url: 'https://marcodpt.github.io/hippo/newspaper/rss.xml'
      }
    ]
  }
})
