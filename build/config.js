import plugin from '../plugins/newspaper/index.js'

export default ({
  plugin,  
  template: Deno.readTextFileSync('plugins/newspaper/templates/bootstrap.html'),
  title: 'Blog',
  url: 'https://marcodpt.github.io/hippo/newspaper/',
  dir: 'docs/newspaper',
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
