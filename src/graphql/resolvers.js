import _ from 'lodash';
import passport from 'passport';
import { Kind } from 'graphql/language';

import Article from '../models/article';
import Tag from '../models/tag';
import User from '../models/user';
import Media from '../models/media';
import Role from '../models/role';
import Menu from '../models/menu';
import MenuDetail from '../models/menuDetail';

const debug = require('debug')('boldrAPI:resolvers');

const firstResult = a => a[0];
const jsonResult = a => {
  return _.isArray(a) ? _.invokeMap(a, 'toJSON') : a.toJSON();
};

export default {
  Date: {
    __parseValue(value) {
      // value from the client
      return new Date(value);
    },

    __serialize(value) {
      // value sent to the client
      return value.getTime();
    },

    __parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return +ast.value;
      }

      return null;
    },
  },

  Article: {
    author(root) {
      return User.query()
        .where({ id: root.userId })
        .then(firstResult)
        .then(jsonResult);
    },

    tags(root) {
      return Article.query()
        .findById(root.id)
        .then(result => result.$relatedQuery('tags'))
        .then(jsonResult);
    },

    media(root) {
      return Media.query().where({ articleId: root.id }).then(jsonResult);
    },
  },

  Tag: {
    articles(root) {
      return Tag.query()
        .findById(root.id)
        .then(result => result.$relatedQuery('articles'))
        .then(jsonResult);
    },
  },
  Menu: {
    details(root) {
      return Menu.query()
        .findById(root.id)
        .then(result => result.$relatedQuery('details'))
        .then(jsonResult);
    },
  },

  User: {
    articles(root) {
      return Article.getArticlesByUserId(root.id);
    },
  },

  Query: {
    articles(root, args) {
      const { offset, limit } = args;

      debug('GraphQL.Resolvers.Query.articles', offset, limit);

      return Article.getArticles(offset, limit).then(jsonResult);
    },

    articlesByUser(root, args) {
      const { username } = args;

      debug('GraphQL.Resolvers.Query.articlesByUser', username);

      return Article.getArticlesByUsername(username).then(jsonResult);
    },

    articlesByTag(root, args) {
      const { tag, offset, limit } = args;

      debug('GraphQL.Resolvers.Query.articlesByUser', tag, offset, limit);

      return Article.getArticlesByTag(tag, offset, limit).then(jsonResult);
    },

    articleById(root, args) {
      debug('GraphQL.Resolvers.Query.articlesById');

      return Article.getArticleById(args.id).then(jsonResult);
    },

    articleBySlug(root, args) {
      debug('GraphQL.Resolvers.Query.articleBySlug');

      return Article.getArticleBySlug(args.slug).then(jsonResult);
    },

    tags() {
      debug('GraphQL.Resolvers.Query.tags');

      return Tag.getTags().then(jsonResult);
    },

    users() {
      debug('GraphQL.Resolvers.Query.users');

      return User.getUsers().then(jsonResult);
    },

    userById(root, args) {
      debug('GraphQL.Resolvers.Query.userById');

      return User.getUserById(args.id).then(jsonResult);
    },

    userByEmail(root, args) {
      debug('GraphQL.Resolvers.Query.userByEmail');

      return User.getUserByEmail(args.email).then(jsonResult);
    },

    userByUsername(root, args) {
      debug('GraphQL.Resolvers.Query.userByUsername');

      return User.getUserByUsername(args.username).then(jsonResult);
    },

    menus(root, args) {
      debug('GraphQL.Resolvers.Query.menus');

      return Menu.getMenus().then(jsonResult);
    },
    menuById(root, args) {
      debug('GraphQL.Resolvers.Query.menus');

      return Menu.getById(args.id).then(jsonResult);
    },
  },
};
