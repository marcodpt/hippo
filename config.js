export default ({
  theme: 'themes/blog.html',
  dir: 'docs',
  sort: ['index', '-date', '-size'],
  selector: 'main',
  taxonomies: ['tags', 'authors'],
  default: {
    date: new Date().toISOString().substr(0, 10),
    tags: '',
    authors: '',
    'og:image': 'image.jpg',
    index: '',
    size: ''
  },
  render: ({data, main, lang, folder}) => {
    const {date} = data
    const img = data['og:image']
    data.date = date ? new Date(date).toLocaleDateString(lang) : date
    data.description = main.querySelector('p')?.textContent
    data['og:image'] = img ? folder+img : img
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
