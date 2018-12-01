'use strict';

const fs = require('fs');
const {promisify} = require('util');
const {createPromisified, findByIdPromisified, removeFilePromisified} = require('../k1_utils');
const {reformatImage} = require('../image_transform');

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

module.exports = function(Asset) {
  Asset.upload = async function(req, res, body) {

    if (!req.query || !req.query.container) {
      throw new Error('container query is required!');
    }

    const {root: storageRoot} = Asset.app.dataSources.storage.settings;
    const {container} = req.query;

    const path = `${storageRoot}${container}/`;

    await createPathIfNotExists(path);

    const Container = Asset.app.models.Container;

    const fileInfo = await saveFileToDisk(Container, container, req, res);
    if (!fileInfo) {
      throw new Error('bad request!');
    }
    const reformatted = await reformatImage(fileInfo);
    if(reformatted){
      fileInfo.name = reformatted.name;
      fileInfo.type = fileInfo.type;
      fileInfo.size = fileInfo.size;
    }
    const fields = {};// if you need the fields you have to change saveFileToDisk function to return them

    const asset = {
      ...fields,
      filename: fileInfo.name,
      title: fileInfo.originalFilename,
      container: fileInfo.container,
      src: `/__api/containers/${fileInfo.container}/download/${fileInfo.name}`,
      type: fileInfo.type,
      size: fileInfo.size,
    };

    return await createPromisified(Asset, asset);
  };

  async function createPathIfNotExists(path){
    try {
      if (! await exists(path)) {
        await mkdir(path);
      }
    } catch (error) {

    }
  } 

  function saveFileToDisk(Container, resource, req, res){
    return new Promise((resolve, reject) => {
      Container.upload(req, res, {
        container: resource,
        }, (error, fileObj) => {
          if (error) {
            return reject(error);
          }

          if (!fileObj.files || !fileObj.files.file) {
            resolve();
            return;
          }

          //here we throw away the rest of the fields, if you need it catch it and use it
          const fileInfo = fileObj.files.file[0];

          resolve(fileInfo);
        });
      }
    );
  }

  Asset.observe('before delete', async (ctx) => {
    const Container = Asset.app.models.Container;

    const toBeDeleted = await findByIdPromisified(ctx.Model, ctx.where.id);

    const filename = toBeDeleted.filename;
    const container = toBeDeleted.container;
    await removeFilePromisified(Container, container, filename);
  });

  Asset.remoteMethod('upload', {
    description: 'Uploads a file',
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
      {arg: 'body', type: 'object', http: {source: 'body'}},
    ],
    returns: {
      arg: 'fileObject',
      type: 'object',
      root: true,
    },
    http: {verb: 'post'},
  });
};
