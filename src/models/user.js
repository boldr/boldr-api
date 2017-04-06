/* eslint-disable id-match */ /* eslint-disable no-unused-vars */
import { Model } from 'objection';
import BaseModel from './base';
// Related Models
import Role from './role';
import Attachment from './attachment';
import ResetToken from './resetToken';
import VerificationToken from './verificationToken';
import Post from './post';
import UserRole from './join/userRole';

const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));

const debug = require('debug')('boldrAPI:user-model');

/**
 * User model representing an account and identity of a person.
 * @class User
 * @extends BaseModel
 * @property {String}   firstName
 * @property {String}   lastName
 * @property {String}   username
 * @property {String}   email
 * @property {String}   bio
 * @property {String}   location
 * @property {String}   avatarUrl
 * @property {String}   profileImage
 * @property {String}   website
 * @property {String}   language
 * @property {Boolean}  verified
 * @property {Object}   [social]
 * @property {Date}     birthday
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */
class User extends BaseModel {
  static get tableName() {
    return 'user';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'email', 'password', 'lastName', 'username'],
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36,
          pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: {
          type: 'string',
        },
        username: { type: 'string' },
        password: { type: 'string' },
        bio: { type: 'string' },
        location: { type: 'string' },
        website: { type: 'string' },
        avatarUrl: { type: 'string' },
        profileImage: { type: 'string' },
        language: { type: 'string' },
        social: {
          type: 'object',
          properties: {},
        },
        verified: { type: 'boolean' },
        birthday: { type: 'date' },
        createdAt: { type: 'date-time' },
        updatedAt: { type: 'date-time' },
      },
    };
  }
  static addTimestamps = true;

  /**
   * An array of attribute names that will be excluded from being returned.
   *
   * @type {array}
   */
  static hidden = [];

  static get relationMappings() {
    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'user.id',
          through: {
            from: 'user_role.userId',
            to: 'user_role.roleId',
          },
          to: 'role.id',
        },
      },
      posts: {
        relation: Model.HasManyRelation,
        modelClass: Post,
        join: {
          from: 'user.id',
          to: 'post.userId',
        },
      },
      uploads: {
        relation: Model.HasManyRelation,
        modelClass: Attachment,
        join: {
          from: 'user.id',
          to: 'attachment.userId',
        },
      },
      verificationToken: {
        relation: Model.HasOneRelation,
        modelClass: VerificationToken,
        join: {
          from: 'user.id',
          to: 'verification_token.userId',
        },
      },
      resetToken: {
        relation: Model.HasOneRelation,
        modelClass: ResetToken,
        join: {
          from: 'user.id',
          to: 'reset_token.userId',
        },
      },
    };
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  stripPassword() {
    delete this['password']; // eslint-disable-line
    return this;
  }
  /**
   * Before inserting make sure we hash the password if provided.
   *
   * @param {object} queryContext
   */
  $beforeInsert(queryContext) {
    super.$beforeInsert(queryContext);

    if (this.hasOwnProperty('password')) {
      this.password = bcrypt.hashSync(this.password, 10);
    }
    if (this.firstName) this.firstName = this.firstName.trim();
    if (this.lastName) this.lastName = this.lastName.trim();
    this.email = this.email.trim();
  }

  /**
   * authenticate is specific to the user instance. compares the hashed password
   * with the password from the request.
   * @param plainText
   * @returns {*}
   */
  authenticate(plainText) {
    return bcrypt.compareAsync(plainText, this.password);
  }
  /**
   * Before updating make sure we hash the password if provided.
   *
   * @param {object} queryContext
   */
  $beforeUpdate(queryContext) {
    super.$beforeUpdate(queryContext);

    if (this.hasOwnProperty('password')) {
      this.password = bcrypt.hashAsync(this.password, 10);
    }
  }
  /**
   * Checks to see if this user has the provided role or not.
   *
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    if (!this.roles) {
      return false;
    }

    const validRoles = this.roles.filter(({ name }) => name === role);

    return validRoles.length;
  }
}

export default User;
