import {DOMParser} from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import {existsSync} from "https://deno.land/std@0.203.0/fs/mod.ts";
import compile from "https://cdn.jsdelivr.net/gh/marcodpt/tint@2.5.0/template.js"
import {tagName, slugify, getPaths, sort} from './js/lib.js'
import save from './js/save.js'
import cnf from './config.js'

const parser = new DOMParser()

const parseHtml = html => parser.parseFromString(html, "text/html")

const parseFile = path => {
  var html = Deno.readTextFileSync(path)
  const document = parseHtml(html)
  if (!document) {
    throw `${path}: error parsing HTML`
  }
  return document
}

const createFile = (dir, {
  main, lang, title, ...vars
}) => {
  Deno.mkdirSync(dir, {recursive: true})
  if (!existsSync(`${dir}/index.html`)) {
    save(`${dir}/index.html`, parseHtml(`
      <!DOCTYPE html>
      <html lang="${lang || theme.documentElement.getAttribute('lang')}">
        <head>
          ${Object.keys(vars).filter(name => vars[name]).map(name =>
            `<meta name="${name}" content="${vars[name]}"/>`
          ).join('\n')}
          <title>${title || theme.title}</title>
        </head>
        <body>
          ${main || '<main></main>'}
        </body>
      </html>
    `))
    console.log(`NEW FILE: ${dir}/index.html`)
  }
}

const matchPath = (route, path) => {
  const R = (route || '').split('*').filter(r => r)
  var i = 0
  return R.reduce((pass, r, p) => {
    if (pass) {
      i = path.indexOf(r, i)
      return (i >= 0 && p > 0) || (i == 0 && p == 0)
    }
  }, true)
}

const getDir = path => {
  const name = '/index.html'
  return path.substr(path.length - name.length) == name ?
    path.substr(0, path.length - name.length + 1) : path
}

const theme = parseFile(cnf.theme)
const main = theme.body.querySelector('main')
const dir = cnf.dir 

//Writing new post
const create = theme.documentElement.getAttribute('data-create')
if (create != null) {
  const title = theme.title
  createFile(dir+(create ? create+'/'+slugify(title) : ''), {
    main: main.outerHTML,
    title,
    ...Object.keys(cnf.meta).reduce((D, name) => ({
      ...D,
      [name]: cnf.meta[name].default
    }), {})
  })
}

//Cleanup, fix and build taxonomies
getPaths(dir).forEach(path => {
  const doc = parseFile(path)

  if (!doc.documentElement.getAttribute('lang')) {
    doc.documentElement.setAttribute('lang',
      theme.documentElement.getAttribute('lang')
    )
  }

  doc.head.childNodes.forEach(child => {
    const tag = tagName(child)
    if (tag == 'meta') {
      const name = child.getAttribute('name')
      const content = child.getAttribute('content')
      const M = cnf.meta[name]
      if (!name || !content || M == null) {
        doc.head.removeChild(child)
      } else if (M.builder) {
        createFile(dir+'/'+name, {
          title: M.title || name
        })
        M.builder(content).forEach(item => {
          createFile(dir+'/'+name+'/'+slugify(item), {
            title: item
          })
        })
      }
    } else if (tag == 'title') {
      doc.querySelector('title').textContent = (doc.title || '')
        .split(' - ')[0]
    } else if (tag) {
      doc.head.removeChild(child)
    }
  }, {})

  doc.body.childNodes.forEach(child => {
    const tag = tagName(child)
    if (tag && tag != 'main') {
      doc.body.removeChild(child)
    }
  })

  save(path, doc)
})

//Read data
const Posts = getPaths(dir).map(path => {
  const doc = parseFile(path)
  const Post = {}

  Post.title = doc.title
  Post.lang = doc.documentElement.getAttribute('lang')
  Post.path = path.substr(dir.length)
  Post.relative = ''

  Post.raw = {}
  Post.data = {}
  Post.taxonomies = {}
  Object.keys(cnf.meta)
    .map(k => doc.head.querySelector(`meta[name="${k}"]`))
    .filter(meta => meta)
    .map(meta => ({
      name: meta.getAttribute('name'),
      content: meta.getAttribute('content')
    }))
    .filter(({content}) => content)
    .map(({name, content}) => ({
      name,
      content,
      data: (cnf.meta[name].formatter || (x => x))(content, Post.lang),
      taxonomies: (cnf.meta[name].builder || (() => []))(content)
    }))
    .forEach(({
      name,
      content,
      data,
      taxonomies
    }) => {
      Post.raw[name] = content
      Post.data[name] = data
      Post.taxonomies[name] = taxonomies
    })
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
    T[name] = T[name].map(item => Posts
      .filter(p => p.path === '/'+name+'/'+slugify(item)+'/index.html')[0]
    )
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
  const doc = parseFile(dir+post.path)
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

  const filterNode = (el, deep) => {
    const p = el.getAttribute('data-path')
    const tag = tagName(el)
    const name = el.getAttribute('name')

    if (tag == 'meta' && (cnf.meta[name] || name) && !p) {
      return null
    } else if (tag == 'template' && !p) {
      return null
    } else if (matchPath(p, post.path)) {
      const target = el.cloneNode(true)
      target.removeAttribute('data-path')
      return target
    }
  }

  var el = theme.head.querySelector('title')
  while (el?.previousElementSibling) {
    el = el.previousElementSibling
    const target = filterNode(el)
    if (target) {
      doc.head.prepend(target)
    }
  }

  el = theme.head.querySelector('title')
  while (el?.nextElementSibling) {
    el = el.nextElementSibling
    const target = filterNode(el)
    if (target) {
      doc.head.append(target)
    }
  }

  const m = doc.body.querySelector('main')
  Array.from(m.attributes).forEach(({nodeName}) => {
    m.removeAttribute(nodeName)
  })
  Array.from(main.attributes).forEach(({nodeName}) => {
    m.setAttribute(nodeName, main.getAttribute(nodeName))
  })

  el = main
  while (el?.previousElementSibling) {
    el = el.previousElementSibling
    const target = filterNode(el)
    if (target) {
      doc.body.prepend(target)
      compile(target, null, theme)(post)
    }
  }

  el = main
  while (el?.nextElementSibling) {
    el = el.nextElementSibling
    const target = filterNode(el)
    if (target) {
      doc.body.append(target)
      compile(target, null, theme)(post)
    }
  }

  save(dir+post.path, doc)
})
