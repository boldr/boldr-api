import path from 'path';
import _debug from 'debug';
import uuid from 'uuid/v4';
import * as objection from 'objection';
import fs from 'fs-extra';
import shortId from 'shortid';
import appRootDir from 'app-root-dir';
import sharp from 'sharp';
import formidable from 'formidable';
import { responseHandler, BadRequest } from '../../core/index';
import Activity from '../../models/activity';
import Attachment from '../../models/attachment';
import { logger } from '../../services';

const debug = _debug('boldrAPI:attachment');
/**
 * Returns a list of all attachments
 * @method listAttachments
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @return {Promise}            the array of attachment objects
 */
export async function listAttachments(req, res, next) {
  try {
    const medias = await Attachment.query();

    return responseHandler(res, 200, medias);
  } catch (error) {
    /* istanbul ignore next */
    return next(error);
  }
}

/**
 * Returns a specific attachment and its data
 * @method getAttachment
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @return {Promise}         the attachment object
 */
export async function getAttachment(req, res, next) {
  try {
    const file = await Attachment.query().findById(req.params.id);
    return responseHandler(res, 200, file);
  } catch (err) {
    /* istanbul ignore next */
    return next(error);
  }
}

/**
 * Update an attachment in the database.
 * @method updateAttachment
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @return {Object}             returns the response
 */
export async function updateAttachment(req, res, next) {
  try {
    const updatedAttachment = await Attachment.query().patchAndFetchById(
      req.params.id,
      req.body,
    );

    await Activity.query().insert({
      userId: req.user.id,
      type: 'update',
      activityAttachment: req.params.id,
    });

    return responseHandler(res, 202, updatedAttachment);
  } catch (error) {
    /* istanbul ignore next */
    return next(error);
  }
}

/**
 * Delete an attachment from the database and file system.
 * @method deleteAttachment
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @param  {Function}       next move to the next middleware
 * @return {Promise}             Promise that the file deleted
 */
export async function deleteAttachment(req, res, next) {
  try {
    // query for the requested attachment
    const attachment = await Attachment.query().findById(req.params.id);
    // return a bad request if we cannot locate
    if (!attachment) {
      return next(new BadRequest());
    }
    // unlink the attachment from the activity
    await Activity.query()
      .delete()
      .where({ activityAttachment: req.params.id })
      .first();

    // remove the attachment from the database
    await Attachment.query().deleteById(req.params.id);
    // remove from the file system.
    fs.removeSync(`./static/uploads/${attachment.safeName}`);
    // send a 204
    return res.status(204).json('Deleted');
  } catch (error) {
    /* istanbul ignore next */
    return next(error);
  }
}

/**
 * Upload an attachment
 * @method uploadAttachment
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @param  {Function}       next move to the next middleware
 * @return {Promise}       the newly created attachment
 */
/* istanbul ignore next */
export function uploadAttachment(req, res, next) {
  const data = {
    attach: {},
    userId: req.user.id,
  };
  const UPLOAD_DIR = path.resolve(appRootDir.get(), './static/uploads/');
  const form = new formidable.IncomingForm();
  form.hash = 'sha1';
  form.keepExtensions = true;
  form.encoding = 'utf-8';
  form.multiples = true;
  form.on('progress', (recv, total) => {
    logger.info(
      'received: %s % (%s / %s bytes)',
      Number(recv / total * 100).toFixed(2),
      recv,
      total,
    );
  });

  form.on('error', err => {
    next(err);
  });

  form.on('aborted', (name, file) => {
    logger.warn(
      'aborted: name="%s", path="%s", type="%s", size=%s bytes',
      file.name,
      file.path,
      file.type,
      file.size,
    );
    res.status(308).end();
  });
  form
    .parse(req)
    .on('fileBegin', (name, file) => {
      // the beginning of the file buffer.
      const id = shortId.generate();
      const fileName = file.name;
      // declare path to formidable. make sure to include the file extension.
      // nobody wants raw blobs.
      const actualFileName = id + path.extname(fileName);
      file.path = path.join(UPLOAD_DIR, actualFileName);
      // inject value attach to 'file' envent
      file.saveName = actualFileName;
    })
    .on('file', (name, file) => {
      data.attach = {
        type: file.type,
        img: {
          data: fs.readFileSync(file.path),
          contentType: file.type,
        },
        imageName: file.saveName,
      };
    })
    .on('field', (field, value) => {
      // receive field argument
      data[field] = value;
    })
    .on('end', async () => {
      const payload = {
        userId: req.user.id,
        fileName: data.attach.imageName,
        safeName: data.attach.imageName,
        fileType: data.attach.type,
        url: `/uploads/${data.attach.imageName}`,
      };
      const newAttachment = await Attachment.query().insert(payload);
      // create an activity entry
      await Activity.query().insert({
        userId: req.user.id,
        type: 'create',
        activityAttachment: newAttachment.id,
      });
      return res.status(201).json(newAttachment);
    });
}
