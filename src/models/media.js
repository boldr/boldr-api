import { Model } from 'objection';
import BaseModel from './base';
import MediaType from './mediaType';

class Media extends BaseModel {
  static get tableName() {
    return 'media';
  }
  static addTimestamps = true;

  static get relationMappings() {
    return {
      mediaType: {
        relation: Model.BelongsToOneRelation,
        modelClass: MediaType,
        join: {
          from: 'media.id',
          to: 'media_type.id',
        },
      },
    };
  }
}

export default Media;
