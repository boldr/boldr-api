import path from 'path';
import _debug from 'debug';
import uuid from 'uuid/v4';
import * as objection from 'objection';
import request from 'request';
import fs from 'fs-extra';
import shortId from 'shortid';
import Busboy from 'busboy';
import { responseHandler, BadRequest } from '../../core/index';
import Activity from '../../models/activity';
import MediaType from '../../models/mediaType';
import Media from '../../models/media';

const debug = _debug('boldrAPI:media');
const gm = require('gm').subClass({ imageMagick: true });

const regex = new RegExp('^.*.((j|J)(p|P)(e|E)?(g|G)|(g|G)(i|I)(f|F)|(p|P)(n|N)(g|G))$');
/**
 * Returns a list of all attachments
 * @method listMedia
 * @param  {Object}        req  the request object
 * @param  {Object}        res  the response object
 * @return {Promise}            the array of attachment objects
 */
export async function listMedia(req, res, next) {
  try {
    const medias = await Media.query().eager('[mediaType]');

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
    const file = await Media.query().findById(req.params.id).eager('[mediaType]');
    return responseHandler(res, 200, file);
  } catch (err) {
    /* istanbul ignore next */
    return next(error);
  }
}

// export async function uploadFromUrl(req, res, next) {
//   const download = (uri, filename, callback) => {
//     request.head(uri, (err, res, body) => {
//       if (!filename.match(regex)) {
//         return next(err);
//       }
//       request(uri).pipe(fs.createWriteStream(`./public/files/${filename}`)).on('close', callback);
//     });
//   };
//
//   const urlParsed = url.parse(req.body.url);
//   if (urlParsed.pathname) {
//     const onlyTheFilename = urlParsed.pathname ? urlParsed.pathname.substring(urlParsed.pathname.lastIndexOf('/') + 1).replace(/((\?|#).*)?$/, '') : ''; // eslint-disable-line
//     const newFilename = uuid() + path.extname(onlyTheFilename);
//     download(urlParsed.href, newFilename, async () => {
//       const newImage = await Image.create({
//         originalname: onlyTheFilename,
//         filename: newFilename,
//         path: `files/${newFilename}`,
//         imageId: shortId.generate(),
//       });
//
//       return res.status(201).json(newImage);
//     });
//   }
// }
