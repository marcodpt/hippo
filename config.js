export default ({
  theme: 'themes/blog.html',
  post: 'post.html',
  dir: 'docs',
  sort: ['-date'],
  selector: 'div.content',
  default: {
    date: new Date().toISOString().substr(0, 10),
    tags: '',
    authors: '',
    'og:image': 'image.jpg'
  },
  data: ({date, tags, ...meta}, {lang}) => ({
    ...meta,
    date: date ? new Date(date+'T12:00:00').toLocaleDateString(lang) : null,
    tags: tags => tags.split(',').map(k => k.trim()).filter(k => k),
    authors: authors => authors.split(',').map(k => k.trim()).filter(k => k)
  })
})
