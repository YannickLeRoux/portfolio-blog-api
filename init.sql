CREATE TABLE posts
(
  ID SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  tags VARCHAR(255),
  subtitle VARCHAR(255),
  content TEXT NOT NULL,
  created_at VARCHAR(255) NOT NULL,
  updated_at VARCHAR(255)
);

INSERT INTO posts
  (title, subtitle, content, created_at, slug, tags)
VALUES
  ('Test title 1', 'Subtitle 12', 'jsjhgjkhdfkgj', '12/12/2009', 'this-slug', 'tag1,tag2');