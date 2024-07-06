# ![](docs/favicon.ico) Hippo
A SSG for Deno

## TODO
 - minimum variables and review default theme
 - do not require files named index.html, any .html file should work
 - rss/atom feed
 - documentation/book theme

## run
```
deno run --allow-read --allow-write --allow-run --allow-env index.js config.js
```

## post: Object
A variable associated to every file named `index.html` in the site directory.

### title: String
The title as was written.

### lang: String
The associated lang attribute.

### path: String
The absolute path in the site directory.

### folder: String
The absolute path to the directory of current post.

### meta: Object
An object with all the meta tags, where:
 - the keys are `name` attribute.
 - the values are the `content` attribute parsed but not formatted.

### posts: Array
Array of children with all itens been an object `post` with all this variables.
In case of taxonomies items, all associated posts will be included.

### children: Object
An object with the same content as `posts` array but with keys been the
`slug` of each post to access an especific content.

### parents: Array
Array of parents with all itens been an object `post` with all this variables.

### root: Object
The first `post` in array of `parents` or the current `post` if it is the root.

### parent: Object
The last `post` in array of `parents`.
