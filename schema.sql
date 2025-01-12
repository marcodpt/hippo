-- sqlite3 data.db < schema.sql
BEGIN TRANSACTION;

CREATE TABLE posts (
  id INTEGER NOT NULL,
  created TEXT NOT NULL,
  modified TEXT NOT NULL,
  path TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX posts1
  ON posts (created);
CREATE INDEX posts2
  ON posts (modified);

CREATE UNIQUE INDEX posts3
  ON posts (path);

CREATE TABLE taxonomies (
  id INTEGER NOT NULL,
  posts_id INTEGER NOT NULL
    REFERENCES posts (id) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX taxonomies1
  ON taxonomies (posts_id);

CREATE TABLE terms (
  id INTEGER NOT NULL,
  taxonomies_id INTEGER NOT NULL
    REFERENCES taxonomies (id) ON UPDATE CASCADE ON DELETE CASCADE,
  posts_id INTEGER NOT NULL
    REFERENCES posts (id) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE INDEX terms1
  ON terms (taxonomies_id);
CREATE UNIQUE INDEX terms2
  ON terms (posts_id);

CREATE TABLE links (
  id INTEGER NOT NULL,
  posts_id INTEGER NOT NULL
    REFERENCES posts (id) ON UPDATE CASCADE ON DELETE CASCADE,
  terms_id INTEGER NOT NULL
    REFERENCES terms (id) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX links1
  ON links (posts_id, terms_id);
CREATE INDEX links2
  ON links (terms_id);

CREATE TABLE files (
  id INTEGER NOT NULL,
  created TEXT NOT NULL,
  path TEXT NOT NULL,
  mime TEXT NOT NULL,
  content BLOB NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX files1
  ON files (created);
CREATE UNIQUE INDEX files2
  ON files (path);

COMMIT;
