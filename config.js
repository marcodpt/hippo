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
  render: Post => {
    const D = Post.data
    //Post.lang = Post.lang == 'null' ? 'en' : Post.lang
    const {date} = Post.data
    const img = Post.data['og:image']
    D.date = D.date ? new Date(D.date).toLocaleDateString() : null
    //D['og:image'] = Post.folder+D['og:image']
  },
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
