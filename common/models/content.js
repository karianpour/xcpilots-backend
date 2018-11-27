'use strict';

const {collectAssetsTobeDeleted, destroyByIdPromisified} = require('../k1_utils');

module.exports = function(Content) {
  Content.observe('before delete', async (ctx) => {
    const assetField = 'file';
    ctx.hookState.assetToDeleted = await collectAssetsTobeDeleted(assetField, ctx);
  });

  Content.observe('after delete', async (ctx) => {
    const Asset = Content.app.models.Asset;
    Promise.all(ctx.hookState.assetToDeleted.map(async (id) => {
      await destroyByIdPromisified(Asset, id);
    }));
  });
};