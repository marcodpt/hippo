export default ({
  sort: ['-date'],
  default: {
    date: new Date().toISOString().substr(0, 10)
  },
  render: Post => {
    const {meta, lang} = Post
    const {date} = meta
    Post.date = date ? new Date(date).toLocaleDateString(lang) : date
  }
})
