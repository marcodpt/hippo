import plugin from '../plugins/news/index.js'

export default ({
  plugin,  
  template: Deno.readTextFileSync('plugins/news/templates/bootstrap.html'),
  title: 'Blog',
  url: 'https://marcodpt.github.io/hippo/',
  dir: 'docs',
  global: {
    email: 'user@mail.com',
    icons: [
      {
        title: 'Facebook',
        icon: 'facebook-f',
        url: 'https://www.facebook.com'
      },
      {
        title: 'Instagram',
        icon: 'instagram',
        url: 'https://www.instagram.com'
      },
      {
        title: 'Twitter',
        icon: 'twitter',
        url: 'https://twitter.com'
      },
      {
        title: 'YouTube',
        icon: 'youtube',
        url: 'https://www.youtube.com'
      }
    ]
  }
})
