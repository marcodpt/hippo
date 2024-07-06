import kind from '../kinds/blog/index.js'

export default ({
  kind,  
  template: Deno.readTextFileSync('kinds/blog/templates/bootstrap.html'),
  title: 'Blog',
  url: 'https://marcodpt.github.io/hippo/',
  dir: 'docs',
  default: {
    date: new Date().toISOString().substr(0, 10),
    tags: '',
    authors: '',
    'og:image': 'image.jpg',
    index: '',
    size: ''
  },
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
