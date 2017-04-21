import { Model } from 'objection';
import BaseModel from './base';
import MediaType from './mediaType';
import User from './user';
import Post from './post';

class Media extends BaseModel {
  static get tableName() {
    return 'media';
  }
  static addTimestamps = true;

  static get relationMappings() {
    return {
      type: {
        relation: Model.BelongsToOneRelation,
        modelClass: MediaType,
        join: {
          from: 'media.mediaType',
          to: 'media_type.id',
        },
      },
      uploader: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'media.userId',
          to: 'user.id',
        },
      },
      posts: {
        relation: Model.ManyToManyRelation,
        modelClass: Post,
        join: {
          from: 'media.id',
          through: {
            from: 'post_media.mediaId',
            to: 'post_media.postId',
          },
          to: 'post.id',
        },
      },
    };
  }
}

export default Media;
