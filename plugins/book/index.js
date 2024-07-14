export default ({
  sort: ['index'],
  default: {
    index: '001'
  },
  render: Post => {
    Post.count = Post.posts.length
    Post.index = Post.parents.map(({meta}) => meta.index)
      .concat(Post.meta.index)
      .filter(i => i).map(i => parseInt(i)).join('.')
    Post.index = Post.index ? '('+Post.index+')' : ''
  }
})
