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

const read = (doc, names) => ({
  title: doc.title,
  lang: doc.documentElement.getAttribute('lang'),
  main: doc.body.querySelector('main') || doc.body,
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

const toPath = str => str.split('/').filter(p => p).join('/')

const folder = path => {
  const P = path.split('/').filter(p => p)
  P.pop()
  return P.join('/')
}

const rawTheme = `<!DOCTYPE html>
<html>
  <head>
    <title>Post</title>
  </head>
  <body>
    <nav if:="level">
      <a each:="parents" href:="relative" text:="title"></a>
    </nav>
    <h1 text:="title"></h1>
    <main></main>
    <ul if:="count">
      <li each:="posts">
        <a href:="relative" text:="title"></a>
      </li>
    </ul>
  </body>
</html>`

export {
  build,
  parse,
  tagName,
  slugify,
  getPaths,
  sort,
  read,
  write,
  toPath,
  folder,
  rawTheme
}
