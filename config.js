export default ({
  theme: 'theme.html',
  post: 'post.html',
  dir: 'public',
  sort: ['-date'],
  meta: {
    date: {
      default: new Date().toISOString().substr(0, 10),
      formatter: (data, lang) => new Date(data+'T12:00:00')
        .toLocaleDateString(lang)
    },
    tags: {
      title: 'Tags',
      default: '',
      builder: data => data.split(',').map(k => k.trim()).filter(k => k)
    },
    description: {
      default: ''
    },
    'og:image': {
      default: 'image.jpg'
    }
  }
})
