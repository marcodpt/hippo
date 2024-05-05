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
    return r ? r : i * (a.raw[k] > b.raw[k] ? 1 : b.raw[k] > a.raw[k] ? -1 : 0)
  }, 0))
}

export {tagName, slugify, getPaths, sort}
