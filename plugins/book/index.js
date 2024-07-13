export default ({
  sort: ['index'],
  default: {
    index: '001'
  },
  render: Post => {
    const {meta, posts, parents} = Post
    Post.index = parseInt(meta.index)
    Post.count = posts.length
  }
})
