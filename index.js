import compile from "https://cdn.jsdelivr.net/gh/marcodpt/tint@2.5.0/template.js"
import {
  tagName,
  slugify,
  getPaths,
  sort,
  read,
  write,
  build,
  parse,
  toPath,
  getDir,
  rawTheme
} from './js/lib.js'
import save from './js/save.js'
import {parse as parseArgs} from "https://deno.land/std/flags/mod.ts"
import {existsSync} from "https://deno.land/std@0.224.0/fs/exists.ts";

const cli = parseArgs(Deno.args)

if (cli.h === true || cli.help === true) {
  console.log('Hippo SSG')
  console.log('hippo [path]')
  Deno.exit(0)
}
const cwd = Deno.cwd()

var scope
import(cwd+'/config.js').then(mod => {
  const cnf = mod.default
  const theme = existsSync(cwd+'/'+cnf.theme, {isFile: true}) ?
    parse(cwd+'/'+cnf.theme) : rawTheme()
  const base = read(theme)
  const main = theme.body.querySelector('main')
  const dir = cnf.dir
  const names = Object.keys(cnf.default)

  const createFile = (dir, data, force) => {
    Deno.mkdirSync(dir, {recursive: true})
    if (force || !existsSync(`${dir}/index.html`)) {
      save(`${dir}/index.html`, build(write({
        ...base,
        ...data
      })))
      if (!force) {
        console.log(`NEW FILE: ${dir}/index.html`)
      }
    }
  }
  scope = {cnf, theme, base, main, dir, names, createFile}

  //Create, edit, and save new file
  if (cli._[0]) {
    var path = ''
    if (existsSync(cli._[0], {isFile: true})) {
      path = cli._[0]
      save(path, build(write(read(parse(path), names, cnf.selector))))
    } else {
      scope.directory = cli._[0]
      path = '/tmp/hippo.html'
      save(path, build(write({
        ...base,
        meta: names.reduce((M, name) => ({
          ...M,
          [name]: cnf.default[name]
        }), {})
      })))
    }
    scope.path = path
    return new Deno.Command(Deno.env.get('EDITOR'), {
      args: [path]
    }).spawn().status
  }
}).then(() => {
  const {
    cnf,
    theme,
    base,
    main,
    dir,
    names,
    createFile,
    path,
    directory
  } = scope
  if (directory) {
    const data = read(parse(path), names, cnf.selector)
    createFile(directory+'/'+slugify(data.title), data)
  }
  console.log('BUILDING: '+cnf.dir)

  getPaths(dir).forEach(path => {
    const doc = parse(path)

    if (!doc.documentElement.getAttribute('lang')) {
      doc.documentElement.setAttribute('lang', base.lang)
    }

    doc.head.childNodes.forEach(child => {
      const tag = tagName(child)
      if (tag == 'meta') {
        const name = child.getAttribute('name')
        const content = child.getAttribute('content')
        if (!name || !content || names.indexOf(name) < 0) {
          doc.head.removeChild(child)
        }
      } else if (tag == 'title') {
        doc.querySelector('title').textContent = (doc.title || '')
          .split(' - ')[0]
      } else if (tag) {
        doc.head.removeChild(child)
      }
    }, {})

    if (doc.body.querySelector('main')) {
      doc.body.childNodes.forEach(child => {
        const tag = tagName(child)
        if (tag && tag != 'main') {
          doc.body.removeChild(child)
        }
      })
    } else {
      const m = main.cloneNode(false)
      m.innerHTML = doc.body.innerHTML
      doc.body.innerHTML = ''
      doc.body.appendChild(m)
    }

    save(path, doc)
  })

  //Cleanup, fix and build taxonomies
  const Taxonomies = {}
  const buildTaxonomy = meta => (meta || '').split(',')
    .map(k => k.trim()).filter(k => k)
  const X = cnf.taxonomies || []

  getPaths(dir).map(path => {
    const Post = read(parse(path), names)

    X.forEach(taxonomy => {
      const slug = slugify(taxonomy)
      if (Taxonomies[slug] == null) {
        Taxonomies[slug] = {}
      }
      createFile(dir+'/'+slug, {
        title: taxonomy
      })
      buildTaxonomy(Post.meta[taxonomy]).forEach(item => {
        const sluged = slugify(item)
        Taxonomies[slug][sluged] = []
        createFile(dir+'/'+slug+'/'+sluged, {
          title: item
        })
      })
    })
  })

  //Read data
  const Posts = getPaths(dir).map(path => {
    const Post = read(parse(path), names)
    const {meta, ...extra} = Post

    X.forEach(taxonomy => {
      const slug = slugify(taxonomy)
      buildTaxonomy(meta[taxonomy]).forEach(item => {
        Taxonomies[slug][slugify(item)].push(Post)
      })
    })

    Post.data = {...meta}
    Post.global = cnf.global
    Post.path = path.substr(dir.length)
    Post.relative = ''
    Post.posts = []
    Post.count = 0
    Post.first = null
    Post.previous = null
    Post.next = null
    Post.last = null
    Post.children = {}
    Post.parents = []
    Post.level = 0
    Post.root = null
    Post.parent = null

    return Post
  })
  sort(Posts, cnf.sort)

  //Set posts and parent
  Posts.forEach(post => {
    var parent = null
    const d = getDir(post.path)
    Posts.forEach(p => {
      const e = getDir(p.path)
      if (
        (parent == null || p.path.length > parent.path.length) &&
        e.length < d.length && getDir(d).indexOf(e) === 0
      ) {
        parent = p
      }
    })
    post.parent = parent
    if (parent) {
      post.parent.posts.push(post)
    }
  })
  Posts.forEach(post => {
    var p = post.parent
    while (p) {
      post.parents.push(p)
      p = p.parent
    }
    post.parents.reverse()
    post.level = post.parents.length
    post.root = post.parents[0] || post

    Object.keys(Taxonomies).forEach(slug => {
      const T = Taxonomies[slug]
      Object.keys(T).forEach(sluged => {
        if (post.path === `/${slug}/${sluged}/index.html`) {
          post.posts = post.posts.concat(T[sluged])
        }
      })
    })

    post.children = post.posts.reduce((C, p) => ({
      ...C,
      [slugify(p.title)]: p
    }), {})
    const n = post.posts.length
    post.count = n
    const first = n ? post.posts[0] : null
    const last = n ? post.posts[n - 1] : null
    post.posts.forEach((p, i) => {
      p.first = first
      p.last = last
      p.previous = i ? post.posts[i - 1] : null
      p.next = i + 1 < n ? post.posts[i + 1] : null
    })
  })

  if (typeof cnf.render == 'function') {
    Posts.forEach(post => {
      cnf.render(post)
    })
  }

  //Render
  Posts.forEach(post => {
    const doc = build(write(post))
    const D = getDir(post.path).split('/').filter(d => d)
    Posts.forEach(p => {
      p.relative = ''
      if (p.path == post.path) {
        return
      }
      const R = getDir(p.path).split('/').filter(r => r)
      for (var i = 0; i < R.length && i < D.length && R[i] == D[i]; i++) {}
      for (var j = i; j < D.length; j++) {
        p.relative += '../'
      }
      for (var j = i; j < R.length; j++) {
        p.relative += R[j]+'/'
      }
      p.folder = p.relative
      p.relative += 'index.html'
    })

    var el = theme.head.querySelector('title')
    while (el?.previousElementSibling) {
      el = el.previousElementSibling
      doc.head.prepend(el.cloneNode())
    }

    el = theme.head.querySelector('title')
    while (el?.nextElementSibling) {
      el = el.nextElementSibling
      doc.head.append(el.cloneNode())
    }

    const target = theme.body.cloneNode(true)
    target.querySelector('main').innerHTML =
      (doc.body.querySelector('main') || doc.body).innerHTML
    doc.body.replaceWith(target)
    compile(target, null, theme)(post)

    save(dir+post.path, doc)
  })
})
