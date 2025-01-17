import compile from "https://cdn.jsdelivr.net/gh/marcodpt/tint@2.5.0/template.js"
import {
  tagName,
  slugify,
  getPosts,
  sort,
  read,
  build,
  parse,
  fbase,
  folder,
  buildTaxonomy
} from './js/lib.js'
import save from './js/save.js'
import rss from './js/rss.js'
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

const mod = await import ('./'+cli._[0])
const cnf = mod.default
const raw = data => {
  const dom = parse(import.meta.dirname+'/js/raw.html')
  if (data.main) {
    dom.body.innerHTML = data.main.innerHTML
  }
  compile(dom.documentElement, null, dom)({
    lang: cnf.lang,
    ...data
  })
  return dom
}

const D = {
  ...(cnf.plugin?.default || {}),
  ...(cnf.default || {})
}
const template = build(cnf.template)
const dir = cnf.dir
const names = Object.keys(D)

const createFile = (path, data, force) => {
  const dir = folder(path)
  Deno.mkdirSync(dir, {recursive: true})
  if (force || !existsSync(path)) {
    save(path, raw(data))
    if (!force) {
      console.log(`NEW FILE: ${path}`)
    }
  }
}

//Create, edit, and save new file
var path = ''
var newFile = ''
if (cli._[1]) {
  if (cli._[1].indexOf('$') < 0 && existsSync(cli._[1], {isFile: true})) {
    path = cli._[1]
    save(path, raw(read(parse(path), names)))
  } else {
    newFile = cli._[1]
    path = '/tmp/hippo.html'
    save(path, raw({
      metas: names.map(name => ({
        name,
        content: D[name]
      }))
    }))
  }
  await new Deno.Command(Deno.env.get('EDITOR'), {
    args: [path]
  }).spawn().status
}

if (newFile) {
  const data = read(parse(path), names)
  createFile(newFile.replace('$', slugify(data.title)), data, true)
}
console.log('BUILDING: '+cnf.dir)

getPosts(dir).forEach(path => {
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

  const main = doc.body.querySelector('main')
  const m = template.querySelector('main')?.cloneNode(false) ||
    doc.createElement('main')
  m.innerHTML = main ? main.innerHTML : doc.body.innerHTML
  doc.body.innerHTML = ''
  doc.body.appendChild(m)

  save(path, doc)
})

//Cleanup, fix and build taxonomies
const Taxonomies = {}
const X = cnf.plugin?.taxonomies || []

getPosts(dir).map(path => {
  const Post = read(parse(path), names)

  X.forEach(taxonomy => {
    const slug = slugify(taxonomy)
    if (Taxonomies[slug] == null) {
      Taxonomies[slug] = {}
    }
    createFile(dir+'/'+slug+'/index.html', {
      title: taxonomy
    })
    buildTaxonomy(Post.meta[taxonomy]).forEach(item => {
      const sluged = slugify(item)
      Taxonomies[slug][sluged] = []
      createFile(dir+'/'+slug+'/'+sluged+'/index.html', {
        title: item
      })
    })
  })
})

const Tp = Object.keys(Taxonomies).map(key => `${key}/index.html`)
//Read data
const Posts = getPosts(dir).map(path => {
  const Post = read(parse(path), names)
  Object.keys(Post.meta).forEach(k => {
    if (typeof D[k] == 'number') {
      const v = Post.meta[k]
      Post.meta[k] = (/^\d+$/.test(v) ? parseInt : parseFloat)(v)
    }
  })
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

  Post.settings = cnf.settings
  Post.path = path.substr(dir.length+1)
  Post.isTaxonomy = Tp.indexOf(Post.path) >= 0
  Post.folder = folder(Post.path)
  Post.posts = []
  Post.parents = []
  Post.root = null
  Post.parent = null

  return Post
})

sort(Posts, cnf.sort || cnf.plugin?.sort || [])

//Set posts and parent
Posts.forEach(post => {
  var parent = null
  const d = fbase(post.path)
  Posts.forEach(p => {
    const e = fbase(p.path)
    if (
      (parent == null || p.path.length > parent.path.length) &&
      e.length < d.length && d.indexOf(e) === 0
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
  post.count = post.posts.length

  Object.keys(Taxonomies).forEach(slug => {
    const T = Taxonomies[slug]
    Object.keys(T).forEach(sluged => {
      if (post.path === `${slug}/${sluged}/index.html`) {
        post.posts = post.posts.concat(T[sluged])
      }
    })
  })
})

//set next and previous
sort(Posts, cnf.sort || cnf.plugin?.sort || [])
Posts.forEach(post => {
  sort(post.posts, cnf.sort || cnf.plugin?.sort || [])
  const index = Posts.indexOf(post)
  post.previous = Posts[index - 1]
  post.next = Posts[index + 1]
  post.count = post.posts.length
})

if (typeof cnf.plugin?.render == 'function') {
  Posts.forEach(post => {
    cnf.plugin?.render(post)
  })
}

if (cnf.rss) {
  Deno.writeTextFileSync(
    dir+'/'+(typeof cnf.rss == 'string' ? cnf.rss : 'rss.xml'), 
    rss(cnf, Posts)
  )
}

//Render
Posts.forEach(post => {
  post.url = cnf.url

  const tpl = build(cnf.template)
  const target = tpl.documentElement
  target.querySelectorAll('body > template[id*="-"]').forEach(customTag => {
    customTag.parentNode.removeChild(customTag)
  })
  target.querySelector('main').innerHTML = post.main.innerHTML
  compile(target, null, template)(post)

  save(dir+'/'+post.path, tpl)
})
