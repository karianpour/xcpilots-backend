'use strict';

const {collectAssetsTobeDeleted, destroyByIdPromisified} = require('../k1_utils');

module.exports = function(News) {
  News.observe('before delete', async (ctx) => {
    const assetField = 'pictures';
    ctx.hookState.assetToDeleted = await collectAssetsTobeDeleted(assetField, ctx);
  });

  News.observe('after delete', async (ctx) => {
    const Asset = News.app.models.Asset;
    Promise.all(ctx.hookState.assetToDeleted.map(async (id) => {
      await destroyByIdPromisified(Asset, id);
    }));
  });
};
