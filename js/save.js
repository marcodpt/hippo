import {tagName} from './lib.js'

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

const print = (element, ident) => {
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
        child => print(child, ident+(name ? '  ' : ''))
      ).filter(c => c.trim()).join('\n')
      return name ? s+'\n'+content+'\n'+ident+`</${name}>` : content
    }
  }
  return `<${element.tagName.toLowerCase()}`
}

export default (path, document) => {
  Deno.writeTextFileSync(path, 
    '<!DOCTYPE html>\n'+print(document.documentElement)
  )
}
