import path from 'path';
import util from 'util';
import _debug from 'debug';
import * as objection from 'objection';
import request from 'request';
import fs from 'fs-extra';
import shortId from 'shortid';
import appRootDir from 'app-root-dir';
import sharp from 'sharp';
import formidable from 'formidable';
import {responseHandler, BadRequest} from '../../core/index';
import Activity from '../../models/activity';
import MediaType from '../../models/mediaType';
import Media from '../../models/media';
import {logger} from '../../services';

const debug = _debug('boldrAPI:media');
/**
 * Returns a list of all attachments
 * @method listMedia
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @return {Promise}            the array of attachment objects
 */
export async function listMedia(req, res, next) {
  try {
    const medias = await Media.query().eager('[type,owner]');

    return responseHandler(res, 200, medias);
  } catch (error) {
    /* istanbul ignore next */
    return next(error);
  }
}

/**
 * Returns a specific media and its data
 * @method getMedia
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @return {Promise}         the media object
 */
export async function getMedia(req, res, next) {
  try {
    const file = await Media.query().findById(req.params.id).eager('[type]');
    return responseHandler(res, 200, file);
  } catch (err) {
    /* istanbul ignore next */
    return next(error);
  }
}
/**
 * Upload a media file
 * @method UploadMedia
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @param  {Function}      next move to the next middleware
 * @return {Promise}       the created media
 */
/* istanbul ignore next */
export function uploadMedia(req, res, next) {
  let thumbnailSet = false;
  const data = {
    media: {},
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
    .on('fileBegin', (name, file) => {
      // the beginning of the file buffer.
      const id = shortId.generate();
      const fileName = file.name;
      // declare path to formidable. make sure to include the file extension.
      // nobody wants raw blobs.
      const actualFileName = id + path.extname(fileName);
      file.path = path.join(UPLOAD_DIR, actualFileName);
      // name the image thumbnail.
      file.thumbnailSaveName = `${id}_small${path.extname(fileName)}`;
      // inject value attach to 'file' envent
      file.saveName = actualFileName;
    })
    .on('file', (name, file) => {
      // here we have the file buffer data
      // we're going to create a thumbnail with it.
      sharp(file.path)
        .resize(320, 240)
        .toFile(path.join(UPLOAD_DIR, file.thumbnailSaveName), (err, info) =>
          console.log(err, info),
        );
      if (!thumbnailSet) {
        data.thumbnail = {
          data: fs.readFileSync(file.path),
          contentType: file.type,
        };
        thumbnailSet = true;
      }
      data.media = {
        type: file.type,
        img: {
          data: fs.readFileSync(file.path),
          contentType: file.type,
        },
        fileName: file.saveName,
        thumbnailName: file.thumbnailSaveName,
      };
    })
    .on('field', (field, value) => {
      // receive field argument
      data[field] = value;
    })
    .parse(req)
    .on('end', async () => {
      const imgRegex = new RegExp(
        '^.*.((j|J)(p|P)(e|E)?(g|G)|(g|G)(i|I)(f|F)|(p|P)(n|N)(g|G))$',
      );
      const vidRegex = new RegExp('^.*.((m|M)(p|P)(4)|(m|M)(k|K)(v|V))$');
      const isImageType = data.media.fileName.match(imgRegex);
      const isVideoType = data.media.fileName.match(vidRegex);

      const payload = {
        userId: req.user.id,
        fileName: data.media.fileName,
        safeName: data.media.fileName,
        thumbName: data.media.thumbnailName,
        mimetype: data.media.type,
        url: `/uploads/${data.media.fileName}`,
        mediaType: isImageType ? 1 : 2,
        path: `${appRootDir.get()}/static/uploads/${data.media.fileName}`,
      };

      const newImage = await Media.query().insert(payload);
      return res.status(201).json(newImage);
    });
}

export function uploadFromUrl(req, res, next) {
  const download = (uri, filename, callback) => {
    request.head(uri, (err, res, body) => {
      if (!filename.match(regex)) {
        return next(err);
      }
      request(uri)
        .pipe(
          fs.createWriteStream(
            `${appRootDir.get()}/static/uploads/${filename}`,
          ),
        )
        .on('close', callback);
    });
  };

  const urlParsed = url.parse(req.body.url);
  if (urlParsed.pathname) {
    const onlyTheFilename = urlParsed.pathname
      ? urlParsed.pathname
          .substring(urlParsed.pathname.lastIndexOf('/') + 1)
          .replace(/((\?|#).*)?$/, '')
      : '';

    const newFilename = uuid() + path.extname(onlyTheFilename);
    download(urlParsed.href, newFilename, async () => {
      const newImage = await Media.query().insert({
        mediaType: 1,
        fileName: newFilename,
        safeName: newFilename,
        url: `/uploads/${newFilename}`,
        userId: req.user.id,
      });

      return res.status(201).json(newImage);
    });
  }
}

/**
 * Update a media file in the database.
 * @method UpdateMedia
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @return {Object}             returns the response
 */
export async function updateMedia(req, res, next) {
  try {
    const updatedMedia = await Media.query().patchAndFetchById(
      req.params.id,
      req.body,
    );
    //
    // await Activity.query().insert({
    //   userId: req.user.id,
    //   type: 'update',
    //   activityAttachment: req.params.id,
    // });

    return responseHandler(res, 202, updatedMedia);
  } catch (error) {
    /* istanbul ignore next */
    return next(error);
  }
}

/**
 * Delete a media file from the database and file system.
 * @method DeleteMedia
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @param  {Function}       next move to the next middleware
 * @return {Promise}             Promise that the file deleted
 */
export async function deleteMedia(req, res, next) {
  try {
    // query for the requested attachment
    const media = await Media.query().findById(req.params.id);
    // return a bad request if we cannot locate
    if (!media) {
      return next(new BadRequest());
    }
    // unlink the attachment from the activity
    // await Activity.query().delete()
    // .where({ activityAttachment: req.params.id }).first();

    // remove the attachment from the database
    await Media.query().deleteById(req.params.id);
    // remove from the file system.
    fs.removeSync(`./static/uploads/${media.safeName}`);
    // send a 204
    return res.status(204).json('Deleted');
  } catch (error) {
    /* istanbul ignore next */
    return next(error);
  }
}
