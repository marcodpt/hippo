export default ({
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
  data: ({date, tags, authors, ...meta}, {lang}) => ({
    ...meta,
    date: date ? new Date(date).toLocaleDateString() : null,
    tags: (tags || '').split(',').map(k => k.trim()).filter(k => k),
    authors: (authors || '').split(',').map(k => k.trim()).filter(k => k)
  }),
  theme: {
    path: 'themes/blog.html',
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
