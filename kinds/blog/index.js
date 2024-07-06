export default ({
  sort: ['index', '-date', '-size'],
  taxonomies: ['tags', 'authors'],
  render: Post => {
    const {meta, main, lang, folder, path, posts} = Post
    const {date} = meta
    const img = meta['og:image']
    const isAuthor = path.startsWith('authors/') &&
      path != 'authors/index.html'
    if (isAuthor) {
      Post.content = main.textContent
    }
    Post.count = posts.length
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
  }
})
