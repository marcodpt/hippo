export default ({
  theme: 'themes/blog.html',
  dir: 'docs',
  sort: ['-date'],
  selector: 'main',
  taxonomies: ['tags', 'authors'],
  default: {
    date: new Date().toISOString().substr(0, 10),
    tags: '',
    authors: '',
    'og:image': 'image.jpg'
  },
  render: ({data, main, lang}) => {
    const {date} = data
    const img = data['og:image']
    data.date = date ? new Date(date).toLocaleDateString(lang) : null
    data.description = main.querySelector('p')?.textContent
    //D['og:image'] = Post.folder+D['og:image']
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
