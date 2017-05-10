import { Model } from 'objection';
import { slugIt } from '../utils';

// Related Models
import Tag from './tag';
import User from './user';
import Attachment from './attachment';
import BaseModel from './base';
import Media from './media';

class Article extends BaseModel {
  static get tableName() {
    return 'article';
  }

  static get softDelete() {
    return true;
  }
  static addTimestamps = true;
  static hidden = ['password'];
  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'article.userId',
          to: 'user.id',
        },
      },
      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: 'article.id',
          through: {
            from: 'article_tag.articleId',
            to: 'article_tag.tagId',
          },
          to: 'tag.id',
        },
      },
      media: {
        relation: Model.ManyToManyRelation,
        modelClass: Media,
        join: {
          from: 'article.id',
          through: {
            from: 'article_media.articleId',
            to: 'article_media.mediaId',
          },
          to: 'media.id',
        },
      },
    };
  }
}

export default Article;
