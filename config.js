export default ({
  theme: 'themes/blog.html',
  title: 'Blog Post',
  base: 'https://marcodpt.github.io/hippo/',
  dir: 'docs',
  sort: ['index', '-date', '-size'],
  taxonomies: ['tags', 'authors'],
  default: {
    date: new Date().toISOString().substr(0, 10),
    tags: '',
    authors: '',
    'og:image': 'image.jpg',
    index: '',
    size: ''
  },
  render: Post => {
    const {meta, main, lang, folder, path, posts} = Post
    const {date} = meta
    const img = meta['og:image']
    const isAuthor = path.startsWith('authors/') &&
      path != 'authors/index.html'
    if (isAuthor) {
      Post.content = main.textContent
    }
    Post.css = isAuthor ? ' d-none' : ''
    Post.date = date ? new Date(date).toLocaleDateString(lang) : date
    Post.description = main.querySelector('p')?.textContent
    Post.image = img ? folder+img : img
    Post.info = isAuthor ? 'author' : 'default'
    Post.display =
      path == 'index.html' ? 'home' :
      path == 'tags/index.html' ? 'tags' :
      path == 'authors/index.html' ? 'authors' :
      posts.length ? 'default' : 'none'
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
