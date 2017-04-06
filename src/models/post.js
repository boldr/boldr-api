import { Model } from 'objection';
import { slugIt } from '../utils';

// Related Models
import Tag from './tag';
import User from './user';
import Attachment from './attachment';
import BaseModel from './base';

class Post extends BaseModel {
  static get tableName() {
    return 'post';
  }
  static softDelete = true;
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
      attachments: {
        relation: Model.ManyToManyRelation,
        modelClass: Attachment,
        join: {
          from: 'post.id',
          through: {
            from: 'post_attachment.postId',
            to: 'post_attachment.attachmentId',
          },
          to: 'attachment.id',
        },
      },
    };
  }
}

export default Post;
