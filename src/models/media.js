import { Model } from 'objection';
import BaseModel from './base';
import MediaType from './mediaType';
import User from './user';

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
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'media.userId',
          to: 'user.id',
        },
      },
    };
  }
}

export default Media;
