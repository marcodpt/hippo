import compile from "https://cdn.jsdelivr.net/gh/marcodpt/tint@2.5.0/template.js"
import {
  tagName,
  slugify,
  getPaths,
  sort,
  read,
  write,
  toStr,
  build,
  parse,
  toPath,
  getDir
} from './js/lib.js'
import save from './js/save.js'
import {parse as parseArgs} from "https://deno.land/std/flags/mod.ts"

const cli = parseArgs(Deno.args)

if (cli.h === true || cli.help === true || !cli._[0]) {
  console.log('Hippo SSG')
  console.log('hippo [command] [path]')
  console.log('\nhippo new')
  console.log('  Creates file with defaults')
  console.log('\nhippo edit [path]')
  console.log('  Edit file in path')
  console.log('\nhippo save [path]')
  console.log('  Save file in path')
  console.log('\nhippo build')
  console.log('  Build site')
  Deno.exit(0)
}

import(Deno.cwd()+'/config.js').then(mod => {
  const cnf = mod.default
  const theme = parse(cnf.theme.path)
  const base = read(theme)
  const main = theme.body.querySelector('main')
  const dir = cnf.dir
  const names = Object.keys(cnf.default)

  const createFile = (dir, data, force) => {
    Deno.mkdirSync(dir, {recursive: true})
    if (force || !toStr(`${dir}/index.html`)) {
      save(`${dir}/index.html`, build(write({
        ...base,
        ...data
      })))
      if (!force) {
        console.log(`NEW FILE: ${dir}/index.html`)
      }
    }
  }

  //Create, edit, and save new file
  const action = cli._[0]
  const path = cli._[1]

  var stop = true
  if (action == 'new' || (action == 'edit' &&
    (!path || path.split('/').pop() != 'index.html' || !toStr(path)
  ))) {
    save(cnf.post, build(write({
      ...base,
      meta: names.reduce((M, name) => ({
        ...M,
        [name]: cnf.default[name]
      }), {})
    })))
    console.log('CREATED: '+cnf.post)
  } else if (action == 'edit') {
    save(cnf.post, build(write({
      ...read(parse(path), names, cnf.selector),
      path: getDir(path)
    })))
    console.log('CREATED: '+cnf.post)
  } else if (action == 'save') {
    const post = build(toStr(cnf.post))
    const data = read(post, names)
    const directory = toPath(
      path ? path+'/'+slugify(data.title) :
      data.path ? data.path :
      dir
    )
    const msg = toStr(directory+'/index.html') ? 'EDITED' : 'CREATED'
    delete data.path
    createFile(directory, data, true)
    Deno.removeSync(cnf.post)
    console.log(msg+': '+directory+'/index.html')
  } else {
    console.log('BUILDING: '+cnf.dir)
    stop = false
  }
  if (stop) {
    return
  }

  //Cleanup, fix and build taxonomies
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

  //Read data
  const Posts = getPaths(dir).map(path => {
    const Post = read(parse(path), names)
    const {meta, ...extra} = Post

    Post.data = cnf.data(meta, extra)
    Post.taxonomies = {}
    Post.theme = cnf.theme
    Object.keys(Post.data)
      .filter(k => Post.data[k] instanceof Array)
      .forEach(taxonomy => {
        Post.taxonomies[taxonomy] = Post.data[taxonomy]
        const slug = slugify(taxonomy)
        createFile(dir+'/'+slug, {
          title: taxonomy
        })
        Post.data[k].forEach(item => {
          createFile(dir+'/'+slug+'/'+slugify(item), {
            title: item
          })
        })
      })

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
    post.children = post.posts.reduce((C, p) => ({
      ...C,
      [slugify(p.title)]: p
    }), {})
    const n = post.posts.length
    post.count = n
    const T = post.taxonomies
    Object.keys(T).forEach(name => {
      T[name] = T[name].map(item => Posts.filter(
        p => p.path === '/'+slugify(name)+'/'+slugify(item)+'/index.html'
      )[0])
    })
    const first = n ? post.posts[0] : null
    const last = n ? post.posts[n - 1] : null
    post.posts.forEach((p, i) => {
      p.first = first
      p.last = last
      p.previous = i ? post.posts[i - 1] : null
      p.next = i + 1 < n ? post.posts[i + 1] : null
    })
  })

  //Render
  Posts.forEach(post => {
    const doc = parse(dir+post.path)
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
