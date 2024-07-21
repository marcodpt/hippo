import {DOMParser} from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const parser = new DOMParser()

const build = html => {
  var doc = null
  try {
    doc = parser.parseFromString(html, "text/html")
  } catch (err) {}
  return doc
}

const parse = path => {
  const html = Deno.readTextFileSync(path)
  return !html ? null : build(html)
}

const tagName = element => element.nodeType === 1 ?
  element.tagName.toLowerCase() : ''

const slugify = str => {
  str = str.replace(/^\s+|\s+$/g, '')
  str = str.toLowerCase()

  const from = 'àáäâãèéëêìíïîòóöôõùúüûñç·/_,:;'
  const to   = 'aaaaaeeeeiiiiooooouuuunc------'
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  str = str.replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return str
}

const sort = (Data, Rule) => {
  if (!(Rule instanceof Array)) {
    return
  }

  const cmp = (a, b) => Rule.reduce((r, k) => {
    const s = k.substr(0, 1)
    const i = s == '-' ? -1 : 1
    if (s == '-' || s == '+') {
      k = k.substr(1)
    }
    return r ? r :
      i * (a.meta[k] > b.meta[k] ? 1 : b.meta[k] > a.meta[k] ? -1 : 0)
  }, 0)

  const check = (a, b) =>
    a != null && b == null ? 1 :
    a == null && b != null ? -1 :
    a == null && b == null ? 0 : cmp(a, b)

  Data.sort((a, b) => {
    const X = a.parents.concat(a)
    const Y = b.parents.concat(b)
    const m = X.length
    const n = Y.length

    for (var i = 0, res = 0; (i < n || i < m) && res == 0; i++) {
      res = check(X[i], Y[i])
    }
    return res
  })
}

const read = (doc, names) => {
  const R = {
    title: doc.title,
    lang: doc.documentElement.getAttribute('lang'),
    main: doc.body.querySelector('main') || doc.body,
    metas: (names || [])
      .map(k => doc.head.querySelector(`meta[name="${k}"]`))
      .filter(meta => meta)
      .map(meta => ({
        name: meta.getAttribute('name'),
        content: meta.getAttribute('content')
      }))
      .filter(({content}) => content)
  }
  R.meta = R.metas.reduce((M, {name, content}) => ({
    ...M,
    [name]: content
  }), {})

  return R
}

const write = ({
  title,
  lang,
  base,
  main,
  meta
}) => `<!DOCTYPE html>
<html${lang ? ` lang="${lang}"` : ''}>
  <head>
    ${Object.keys(meta).map(name =>
      `<meta name="${name}" content="${meta[name]}"/>`
    ).join('\n    ')}
    ${base ? `<base href="${base}">` : ''}
    <title>${title}</title>
  </head>
  <body>${(main ? main.innerHTML : '').trim()}</body>
</html>`

const folder = path => {
  const P = path.split('/').filter(p => p && p != '.')
  P.pop()
  return P.join('/')
}

const fname = path => path.split('/').pop()
const fbase = path => fname(path) == 'index.html' ? folder(path) : path

const ext = fname => {
  const E = fname.split('.')
  E.shift()
  return E.join('.')
}

const getPosts = path => {
  const Files = []
  const hasExt = name => ext(name) == 'html'
  for (const entry of Deno.readDirSync(path)) {
    if (entry.isDirectory) {
      getPosts(`${path}/${entry.name}`).filter(hasExt).forEach(file => {
        Files.push(file)
      })
    } else if (hasExt(entry.name)) {
      Files.push(`${path}/${entry.name}`)
    }
  }
  return Files
}

const buildTaxonomy = meta => (meta || '').split(',')
  .map(k => k.trim()).filter(k => k)

export {
  build,
  parse,
  tagName,
  slugify,
  getPosts,
  sort,
  read,
  write,
  folder,
  fbase,
  buildTaxonomy
}
