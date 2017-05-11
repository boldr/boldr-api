import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';

const schema = `
scalar Date
type Article {
  id: ID!
  title: String!
  slug: String!
  content: String!
  rawContent: String
  excerpt: String!
  featured: Boolean!
  published: Boolean!
  featureImage: String!
  createdAt: Date!
  updatedAt: Date!
  deletedAt: Date
  author: User!
  tags: [Tag]
  media: [Media]
}
type Tag {
  id: ID!
  name: String!
  description: String
  articles: [Article]
}
type Role {
  id: ID!
  name: String!
  description: String
  image: String
  users: [User]
}
type Media {
  id: ID!
  fileName: String!
  safeName: String!
  thumbName: String!
  fileDescription: String!
  mediaType: Int!
  mimetype: String
  url: String!
  path: String
  userId: String!
  createdAt: Date!
  updatedAt: Date
}
type User {
  id: ID!
  email: String!
  username: String!
  articles: [Article]
  roles: [Role]
  firstName: String!
  lastName: String!
  location: String
  birthday: Date
  bio: String
  language: String
  avatarUrl: String!
  website: String
}
type Setting {
  id: ID!
  key: String!
  value: String!
  label: String
  description: String
}
type Menu {
  id: Int!
  uuid: String!
  name: String!
  safeName: String
  attributes: String
  restricted: Boolean!
  details: [MenuDetail]
}
type MenuDetail {
  id: Int!
  uuid: String!
  safeName: String!
  name: String!
  cssClassname: String
  hasDropdown: Boolean!
  order: Int!
  mobileHref: String!
  href: String!
  icon: String!
  children: [MenuDetail]
}
# the schema allows the following query:
type Query {
  articles(offset: Int!, limit: Int!): [Article]
  articlesByUser(username: String!): [Article]
  articlesByTag(tag: String!, offset: Int!, limit: Int!): [Article]
  articleById(id: String!): Article
  articleBySlug(slug: String!): Article
  tags: [Tag]
  users: [User]
  userById(id: String!): User
  userByEmail(email: String!): User
  userByUsername(username: String!): User
  menus: [Menu]
  menuById(id: Int!):[Menu]
}

schema {
  query: Query
}
`;

export default makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});
