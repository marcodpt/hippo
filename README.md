# ![](favicon.ico) Hippo
A SSG for Deno

## run
```
deno run --allow-read --allow-write index.js
```

## Attributes
Some special attributes used to configure the behavior of `hippo` when
rebuilding your site

### data-site
Only acceptable in `config.html` in the `html` tag.
The folder of your current site.

### data-sort
Only acceptable in `config.html` in the `html` tag.
The order where posts should be sorted separated with comma(,) and is allowed
before each field a minus(-) for `DESC` sort and a plus(+) for `ASC` sort.
All the properties are sorted as provided in the post before appling any
formatter.

### data-create
Only acceptable in `config.html` in the `html` tag.
The directory of a new file.
The new file will use the current `title`, `meta`, `main` and imediate child of
`head` and `body` with `data-preserve` attribute.

### data-type
Only acceptable in `config.html` in the `meta` tag with `name` attribute and
imediate child of `head`.
This define the data type of the content, and will be formatted:
 - taxonomy: A type used to build taxonomies formated after sorting.
 - date: Uses `toLocaleDateString` combined with `lang` attribute to format
ISO dates after sorting.
 - datetime: Uses `toLocaleString` combined with `lang` attribute to format
ISO dates after sorting.
 - integer: parseInt before sorting then uses `toLocaleString`.
 - number: parseFloat before sorting then uses `toLocaleString`.
 - bool: blank or 'false' string will be `false`, everything else `true`.
Formatter applied before sorting.
 - blank or everything else will keep raw format.

### data-path
Only acceptable in `config.html` in tags imediate child of `head` or `body`.
Every `head` imediate child other than `title` and `meta` with `data-type` will
be prepend in post if it appear before `title` or append if it appears after.
Every `body` child other than `template` and `main` will be prepend in post if
it appear before `main` or append if it appears after.
To skip this rules and selective use a tag in the posts use the `data-path`
attribute, it will only be used in posts matching the path.
The wildcard `*` is allowed.

### data-preserve
Acceptable in any `post` or `config.html` in any tag that is an imediate child
of `head` and `body`.
When a post is builded, the first thing hippo will do is remove every node
inside the `head` and the `body`, the exceptions are:
 - `main` as imediate child of `body`: this is where you should place the
content.
 - `title` as imediate child of `head`: this is the title of the post.
 - `meta` as imediate child of `head` that contains `name` and `content`
attributes and the `config.html` declared a `meta` with same `name` and a
`data-type` attribute.
The imediate child of `head` and `body` with a `data-preserve` attribute will
also not be removed.

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

### raw: Object
An object with all the meta tags, where:
 - the keys are `name` attribute.
 - the values are the `content` attribute parsed but not formatted.

### data: Object
An object with all the non taxonomies meta tags, where:
 - the keys are `name` attribute.
 - the values are the `content` attribute formatted as especified in `data-type`.

### taxonomies
An object with all the taxonomies meta tags, where:
 - the keys are `name` attribute.
 - the values are the `post` array associated with the items of the taxonomy
in the exactly same order as was in the current `post`.

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
