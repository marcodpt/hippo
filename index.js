import {DOMParser} from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import {existsSync} from "https://deno.land/std@0.203.0/fs/mod.ts";
import compile from "https://cdn.jsdelivr.net/gh/marcodpt/tint@2.5.0/template.js"

const parser = new DOMParser()

const readFiles = path => {
  const Files = []
  for (const entry of Deno.readDirSync(path)) {
    if (entry.isDirectory) {
      readFiles(`${path}/${entry.name}`).forEach(file => {
        Files.push(file)
      })
    } else {
      Files.push(`${path}/${entry.name}`)
    }
  }
  return Files
}

const filterExtensions = (Files, Extensions) => Files.filter(
  fileName => Extensions.reduce(
    (match, ext) => match ||
      fileName.substr(fileName.length - ext.length) == ext
  , false)
)

const parseHtml = html => parser.parseFromString(html, "text/html")

const parseFile = path => {
  var html = Deno.readTextFileSync(path)
  const document = parseHtml(html)
  if (!document) {
    throw `${path}: error parsing HTML`
  }
  return document
}

const tagName = element => element.nodeType === 1 ?
  element.tagName.toLowerCase() : ''

const isSelfClosing = element => [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
].indexOf(tagName(element)) >= 0

const getAttributes = element => Array.from(element.attributes || [])
  .reduce((X, {
    name,
    value
  }) => ({
    ...X,
    [name]: value
  }), {})

const printHTML = (element, ident) => {
  const MAX_LENGTH = 80
  if (element.nodeType === 3) {
    return element.textContent
  }
  ident = (ident || '')
  const A = getAttributes(element)
  const Attrs = Object.keys(A).map(k => `${k}="${A[k]}"`)
  var attrs = Attrs.join(' ')
  const name = tagName(element)

  if (attrs.length + ident.length + name.length + 3 > MAX_LENGTH) {
    attrs = '\n'+Attrs.map(attr => ident+'  '+attr).join('\n')+'\n'+ident
  } else if (attrs) {
    attrs = ' '+attrs
  }
  var s = ident+'<'+name+attrs
  const children = Array.from(
    (name == 'template' ? element.content : element).childNodes
  )

  if (isSelfClosing(element)) {
    return s+'/>'
  } else {
    s += '>'
    if (!children.length) {
      return name ? s+`</${name}>` : ''
    } else if (children.reduce(
      (isText, child) => isText ||
        (child.nodeType === 3 && child.textContent.trim())
    , false) || (children.length == 1 && children[0].nodeType === 3)) {
      return s+`${element.innerHTML}</${name}>`
    } else {
      const content = children.map(
        child => printHTML(child, ident+(name ? '  ' : ''))
      ).filter(c => c.trim()).join('\n')
      return name ? s+'\n'+content+'\n'+ident+`</${name}>` : content
    }
  }
  return `<${element.tagName.toLowerCase()}`
}

const saveHTML = (path, document) => {
  Deno.writeTextFileSync(path, 
    '<!DOCTYPE html>\n'+printHTML(document.documentElement)
  )
}

const createFile = (dir, {
  main, lang, title, ...vars
}) => {
  Deno.mkdirSync(dir, {recursive: true})
  if (!existsSync(`${dir}/index.html`)) {
    saveHTML(`${dir}/index.html`, parseHtml(`
      <!DOCTYPE html>
      <html lang="${lang || config.documentElement.getAttribute('lang')}">
        <head>
          ${Object.keys(vars).filter(name => vars[name]).map(name =>
            `<meta name="${name}" content="${vars[name]}"/>`
          ).join('\n')}
          <title>${title || config.title}</title>
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

const slugify = str => {
  str = str.replace(/^\s+|\s+$/g, '')
  str = str.toLowerCase()

  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;"
  var to   = "aaaaeeeeiiiioooouuuunc------"
  for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  str = str.replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

  return str
}

const unslugify = slug => slug.replace(/\-/g, " ").replace(/\w\S*/g,
  text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
)

const getDir = path => {
  const name = '/index.html'
  return path.substr(path.length - name.length) == name ?
    path.substr(0, path.length - name.length + 1) : path
}

const getPaths = dir => filterExtensions(readFiles(dir), ['index.html'])

const items = str => (str || '').split(',').map(k => k.trim()).filter(k => k)

const config = parseFile(`config.html`)
const main = config.body.querySelector('main')
const dir = config.documentElement.getAttribute('data-site')

//Defining Types
const Types = config.head.getElementsByTagName('meta')
  .reduce((T, meta) => {
    const name = meta.getAttribute('name')
    const key = meta.getAttribute('data-type')
    if (name && key && T[key]) {
      T[key].push(name)
    }
    return T
  }, {
    'taxonomy': [],
    'date': [],
    'datetime': [],
    'integer': [],
    'number': [],
    'bool': []
  })

//Defining Defaults
const Vars = {}
const Defaults = config.head.getElementsByTagName('meta')
  .reduce((D, meta) => {
    const name = meta.getAttribute('name')
    const t = meta.getAttribute('data-type')
    const content = meta.getAttribute('content')
    if (name && t != null) {
      D[name] = content || ''
      if (Types.taxonomy.indexOf(name) < 0 && content) {
        Vars[name] = content
      }
    }
    return D
  }, {})

//Writing new post
const create = config.documentElement.getAttribute('data-create')
if (create != null) {
  const title = config.title
  createFile(dir+(create ? create+'/'+slugify(title) : ''), {
    main: main.outerHTML,
    title,
    ...Defaults
  })
}

//Cleanup, fix and build taxonomies
getPaths(dir).forEach(path => {
  const doc = parseFile(path)

  if (!doc.documentElement.getAttribute('lang')) {
    doc.documentElement.setAttribute('lang',
      config.documentElement.getAttribute('lang')
    )
  }

  doc.head.childNodes.forEach(child => {
    const tag = tagName(child)
    if (tag == 'meta') {
      const name = child.getAttribute('name')
      const content = child.getAttribute('content')
      if (
        child.getAttribute('data-preserve') == null &&
        (!name || !content || Defaults[name] == null)
      ) {
        doc.head.removeChild(child)
      }
      if (name && content && Types.taxonomy.indexOf(name) >= 0) {
        createFile(dir+'/'+name, {
          title: unslugify(name),
          ...Vars
        })
        items(content).forEach(item => {
          createFile(dir+'/'+name+'/'+slugify(item), {
            title: item,
            ...Vars
          })
        })
      }
    } else if (tag == 'title') {
      doc.querySelector('title').textContent = (doc.title || '')
        .split(' - ')[0]
    } else if (tag && child.getAttribute('data-preserve') == null) {
      doc.head.removeChild(child)
    }
  }, {})

  doc.body.childNodes.forEach(child => {
    const tag = tagName(child)
    if (tag && tag != 'main' && child.getAttribute('data-preserve') == null) {
      doc.body.removeChild(child)
    }
  })

  saveHTML(path, doc)
})

//Read data
const Posts = getPaths(dir).map(path => {
  const doc = parseFile(path)
  const Post = {}

  Post.title = doc.title
  Post.lang = doc.documentElement.getAttribute('lang')
  Post.path = path.substr(dir.length)
  Post.relative = ''
  Post.raw = doc.head.getElementsByTagName('meta').reduce((R, meta) => {
    const name = meta.getAttribute('name')
    const content = meta.getAttribute('content')
    if (name && content != null && Defaults[name] != null) {
      const isInt = Types['integer'].indexOf(name) >= 0
      if (!isNaN(content) && (isInt ||
        Types['number'].indexOf(name) >= 0
      )) {
        R[name] = isInt ? parseInt(content) : parseFloat(content)
      } else if (Types['bool'].indexOf(name) >= 0) {
        R[name] = content.toLowerCase() == 'false' || !content ? false : true
      } else {
        R[name] = content
      }
    }
    return R
  }, {})
  Post.data = {}
  Post.taxonomies = Types.taxonomy.reduce((T, t) => ({
    ...T,
    [t]: []
  }), {})
  Object.keys(Post.raw).forEach(name => {
    if (Types.taxonomy.indexOf(name) >= 0) {
      Post.taxonomies[name] = items(Post.raw[name]).map(i => slugify(i))
    } else if (typeof Post.raw[name] == 'number' && (
        Types['integer'].indexOf(name) >= 0 ||
        Types['number'].indexOf(name) >= 0
    )) {
      Post.data[name] = Post.raw[name].toLocaleString(Post.lang)
    } else if (Types['datetime'].indexOf(name) >= 0) {
      Post.data[name] = new Date(Post.raw[name]).toLocaleString(Post.lang)
    } else if (Types['date'].indexOf(name) >= 0) {
      Post.data[name] = new Date(Post.raw[name]+'T12:00:00')
        .toLocaleDateString(Post.lang)
    } else {
      Post.data[name] = Post.raw[name]
    }
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

//Sort posts
const Sort = items(config.documentElement.getAttribute('data-sort'))
if (Sort.length) {
  Posts.sort((a, b) => Sort.reduce((r, k) => {
    const s = k.substr(0, 1)
    const i = s == '-' ? -1 : 1
    if (s == '-' || s == '+') {
      k = k.substr(1)
    }
    return r ? r : i * (a.raw[k] > b.raw[k] ? 1 : b.raw[k] > a.raw[k] ? -1 : 0)
  }, 0))
}

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
    T[name] = T[name].map(slug => Posts
      .filter(p => p.path === '/'+name+'/'+slug+'/index.html')[0]
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

    if (tag == 'meta' && (
      el.getAttribute('data-type') != null ||
      el.getAttribute('name')
    ) &&  !p) {
      return null
    } else if (tag == 'template' && !p) {
      return null
    } else if (matchPath(p, post.path)) {
      const target = el.cloneNode(true)
      target.removeAttribute('data-path')
      return target
    }
  }

  var el = config.head.querySelector('title')
  while (el?.previousElementSibling) {
    el = el.previousElementSibling
    const target = filterNode(el)
    if (target) {
      doc.head.prepend(target)
    }
  }

  el = config.head.querySelector('title')
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
      compile(target, null, config)(post)
    }
  }

  el = main
  while (el?.nextElementSibling) {
    el = el.nextElementSibling
    const target = filterNode(el)
    if (target) {
      doc.body.append(target)
      compile(target, null, config)(post)
    }
  }

  saveHTML(dir+post.path, doc)
})
