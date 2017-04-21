import { Model } from 'objection';
import Media from '../media';
import Post from '../post';
import BaseModel from '../base';

/**
 * This is the join table connecting media to posts.
 *
 * @see ../Media
 * @see ../Post
 * @extends ../BaseModel
 */
class PostMedia extends BaseModel {
  static get tableName() {
    return 'post_media';
  }

  static addTimestamps = false;

  static get idColumn() {
    return ['postId', 'mediaId'];
  }

  static get relationMappings() {
    return {
      media: {
        relation: Model.BelongsToOneRelation,
        modelClass: Media,
        join: {
          from: 'post_media.mediaId',
          to: 'media.id',
        },
      },
      post: {
        relation: Model.BelongsToOneRelation,
        modelClass: Post,
        join: {
          from: 'post_media.postId',
          to: 'post.id',
        },
      },
    };
  }
}

export default PostMedia;
