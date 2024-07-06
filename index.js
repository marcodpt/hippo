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
  dir,
  rawTheme
} from './js/lib.js'
import save from './js/save.js'
import {parse as parseArgs} from "https://deno.land/std/flags/mod.ts"
import {existsSync} from "https://deno.land/std@0.224.0/fs/exists.ts";

const cli = parseArgs(Deno.args)

if (cli.h === true || cli.help === true || !cli._[0] || !existsSync(cli._[0], {
  isFile: true
})) {
  console.log('Hippo SSG')
  console.log('hippo [config] [path]')
  Deno.exit(0)
}

var scope
if (['/', '.'].indexOf(cli._[0].substr(0, 1)) < 0) {
  cli._[0] = './'+cli._[0]
}
const cwd = dir(cli._[0])
import(cli._[0]).then(mod => {
  const cnf = mod.default
  const template = build(cnf.template || rawTheme)
  const base = {
    title: cnf.title,
    lang: cnf.lang,
    base: cnf.base
  }
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
  scope = {cnf, template, base, dir, names, createFile}

  //Create, edit, and save new file
  if (cli._[1]) {
    var path = ''
    if (existsSync(cli._[1], {isFile: true})) {
      path = cli._[1]
      save(path, build(write(read(parse(path), names))))
    } else {
      scope.directory = cli._[1]
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
    template,
    base,
    dir,
    names,
    createFile,
    path,
    directory
  } = scope
  if (directory) {
    const data = read(parse(path), names)
    createFile(directory+'/'+slugify(data.title), data)
  }
  console.log('BUILDING: '+cnf.dir)

  getPaths(dir).forEach(path => {
    const doc = parse(path)

    if (!doc.documentElement.getAttribute('lang')) {
      doc.documentElement.setAttribute('lang', cnf.lang)
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
      const m = template.querySelector('main')?.cloneNode(false) ||
        doc.createElement('main')
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
  const X = cnf.kind?.taxonomies || []

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

    Post.taxonomies = {}
    X.forEach(taxonomy => {
      Post.taxonomies[taxonomy] = []
      const slug = slugify(taxonomy)
      buildTaxonomy(meta[taxonomy]).forEach(item => {
        Post.taxonomies[taxonomy].push(item)
        Taxonomies[slug][slugify(item)].push(Post)
      })
    })

    Post.data = {...meta}
    Post.global = cnf.global
    Post.path = path.substr(dir.length+1)
    Post.folder = getDir(Post.path)
    Post.posts = []
    Post.parents = []
    Post.root = null
    Post.parent = null

    return Post
  })
  sort(Posts, cnf.sort || cnf.kind?.sort || [])

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
    const T = post.taxonomies
    Object.keys(T).forEach(k => {
      T[k] = T[k].map(item => Posts.filter(post =>
        post.path == `${slugify(k)}/${slugify(item)}/index.html`
      )).reduce((T, Posts) => T.concat(Posts), [])
    })
  })
  Posts.forEach(post => {
    var p = post.parent
    while (p) {
      post.parents.push(p)
      p = p.parent
    }
    post.parents.reverse()
    post.root = post.parents[0] || post

    Object.keys(Taxonomies).forEach(slug => {
      const T = Taxonomies[slug]
      Object.keys(T).forEach(sluged => {
        if (post.path === `${slug}/${sluged}/index.html`) {
          post.posts = post.posts.concat(T[sluged])
        }
      })
    })
  })

  if (typeof cnf.kind?.render == 'function') {
    Posts.forEach(post => {
      cnf.kind?.render(post)
    })
  }

  //Render
  Posts.forEach(post => {
    const doc = build(write({
      base: cnf.base,
      ...post
    }))

    var el = template.head.querySelector('title')
    while (el?.previousElementSibling) {
      el = el.previousElementSibling
      doc.head.prepend(el.cloneNode())
    }

    el = template.head.querySelector('title')
    while (el?.nextElementSibling) {
      el = el.nextElementSibling
      doc.head.append(el.cloneNode())
    }

    const target = template.body.cloneNode(true)
    target.querySelectorAll('body > template[id*="-"]').forEach(customTag => {
      target.removeChild(customTag)
    })
    target.querySelector('main').innerHTML =
      (doc.body.querySelector('main') || doc.body).innerHTML
    doc.body.replaceWith(target)
    compile(target, null, template)(post)

    save(dir+'/'+post.path, doc)
  })
})
