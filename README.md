# ![](docs/favicon.ico) Hippo
A SSG for Deno

## TODO
 - rss/atom feed
 - documentation/book theme

## run
```
deno run --allow-read --allow-write --allow-run --allow-env index.js build/newspaper.js
deno run --allow-read --allow-write --allow-run --allow-env index.js build/blog.js
```

## post: Object
A variable associated to every file named `index.html` in the site directory.

### title: String
The title as was written.

### lang: String
The associated lang attribute.

### main: Dom element
The content of the post.

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

### parents: Array
Array of parents with all itens been an object `post` with all this variables.

### root: Object
The first `post` in array of `parents` or the current `post` if it is the root.

### parent: Object
The last `post` in array of `parents` or null if the current `post` is the root.
