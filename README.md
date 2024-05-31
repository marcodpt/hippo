# ![](docs/favicon.ico) Hippo
A SSG for Deno

## TODO
 - rss/atom feed
 - do not require files named index.html, any .html file should work
 - theme variables should compile before rendering and isolated
 - lazy compute data properties (problem with image path)
 - allow to use query selector on main while generating data (create description based on first p text content)
 - update meta properties and taxonomies
 - pass selector in command line
 - pass config file in command line
 - documentation
 - book theme
 - blog theme

## run
```
deno run --allow-read --allow-write --allow-run --allow-env index.js
```

## post: Object
A variable associated to every file named `index.html` in the site directory.

### title: String
The title as was written.

### lang: String
The associated lang attribute.

### path: String
The absolute path in the site directory.

### relative: String
The relative path to the current post or empty string in case of been itself.

### folder: String
The relative path to the directory of current post.

### meta: Object
An object with all the meta tags, where:
 - the keys are `name` attribute.
 - the values are the `content` attribute parsed but not formatted.

### data: Object
An object with the meta tags transformed with `data` function defined by user.

### posts: Array
Array of children with all itens been an object `post` with all this variables.
In case of taxonomies items, all associated posts will be included.

### count: Integer
The number of `posts`.

### first: Object
The first `post` in parent array of `posts`.

### previous: Object
The previous `post` in parent array of `posts`.

### next: Object
The next `post` in parent array of `posts`.

### last: Object
The last `post` in parent array of `posts`.

### children: Object
An object with the same content as `posts` array but with keys been the
`slug` of each post to access an especific content.

### parents: Array
Array of parents with all itens been an object `post` with all this variables.

### level: Integer
The number of `parents`.

### root: Object
The first `post` in array of `parents` or the current `post` if it is the root.

### parent: Object
The last `post` in array of `parents`.
