import {DOMParser} from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const parser = new DOMParser()

const toStr = path => {
  var str = ''
  try {
    str = Deno.readTextFileSync(path)
  } catch (err) {}
  return str
}

const build = html => {
  var doc = null
  try {
    doc = parser.parseFromString(html, "text/html")
  } catch (err) {}
  return doc
}

const parse = path => {
  const html = toStr(path)
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

const getPaths = path => {
  const Files = []
  const ext = 'index.html'
  const hasExt = name => name.substr(name.length - ext.length) == ext
  for (const entry of Deno.readDirSync(path)) {
    if (entry.isDirectory) {
      getPaths(`${path}/${entry.name}`).filter(hasExt).forEach(file => {
        Files.push(file)
      })
    } else if (hasExt(entry.name)) {
      Files.push(`${path}/${entry.name}`)
    }
  }
  return Files
}

const sort = (Data, Rule) => {
  if (!(Rule instanceof Array)) {
    return
  }
  Data.sort((a, b) => Rule.reduce((r, k) => {
    const s = k.substr(0, 1)
    const i = s == '-' ? -1 : 1
    if (s == '-' || s == '+') {
      k = k.substr(1)
    }
    return r ? r :
      i * (a.meta[k] > b.meta[k] ? 1 : b.meta[k] > a.meta[k] ? -1 : 0)
  }, 0))
}

const read = (doc, names, selector) => ({
  path: doc.documentElement.getAttribute('data-path'),
  title: doc.title,
  lang: doc.documentElement.getAttribute('lang'),
  main: (doc.body.querySelector(selector || 'main') || doc.body).innerHTML,
  meta: (names || [])
    .map(k => doc.head.querySelector(`meta[name="${k}"]`))
    .filter(meta => meta)
    .map(meta => ({
      name: meta.getAttribute('name'),
      content: meta.getAttribute('content')
    }))
    .filter(({content}) => content)
    .reduce((M, {name, content}) => ({
      ...M,
      [name]: content
    }), {})
})

const write = ({
  path,
  title,
  lang,
  main,
  meta
}) => `<!DOCTYPE html>
<html${lang ? ` lang="${lang}"` : ''}${path ? ` data-path="${path}"` : ''}>
  <head>
    ${Object.keys(meta).map(name =>
      `<meta name="${name}" content="${meta[name]}"/>`
    ).join('\n    ')}
    <title>${title}</title>
  </head>
  <body>${(main || '').trim()}</body>
</html>`

const toPath = str => str.split('/').filter(p => p).join('/')

const getDir = path => {
  const name = '/index.html'
  return path.substr(path.length - name.length) == name ?
    path.substr(0, path.length - name.length + 1) : path
}

export {
  toStr,
  build,
  parse,
  tagName,
  slugify,
  getPaths,
  sort,
  read,
  write,
  toPath,
  getDir
}
