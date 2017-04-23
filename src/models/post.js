import { Model } from 'objection';
import { slugIt } from '../utils';

// Related Models
import Tag from './tag';
import User from './user';
import Attachment from './attachment';
import BaseModel from './base';
import Media from './media';

class Post extends BaseModel {
  static get tableName() {
    return 'post';
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
          from: 'post.userId',
          to: 'user.id',
        },
      },
      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: 'post.id',
          through: {
            from: 'post_tag.postId',
            to: 'post_tag.tagId',
          },
          to: 'tag.id',
        },
      },
      media: {
        relation: Model.ManyToManyRelation,
        modelClass: Media,
        join: {
          from: 'post.id',
          through: {
            from: 'post_media.postId',
            to: 'post_media.mediaId',
          },
          to: 'media.id',
        },
      },
    };
  }
}

export default Post;
