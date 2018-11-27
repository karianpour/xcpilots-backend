'use strict';

const {collectAssetsTobeDeleted, destroyByIdPromisified} = require('../k1_utils');

module.exports = function(Background) {
  Background.observe('before delete', async (ctx) => {
    const assetField = 'pictures';
    ctx.hookState.assetToDeleted = await collectAssetsTobeDeleted(assetField, ctx);
  });

  Background.observe('after delete', async (ctx) => {
    const Asset = Background.app.models.Asset;
    Promise.all(ctx.hookState.assetToDeleted.map(async (id) => {
      await destroyByIdPromisified(Asset, id);
    }));
  });
    
};
