'use strict';

const collectAssetsTobeDeleted = async (assetField, ctx) =>{
  const toBeDeleted = await findByIdPromisified(ctx.Model, ctx.where.id);
  let assetsTobeDeleted;
  if(Array.isArray(toBeDeleted[assetField])){
    assetsTobeDeleted = toBeDeleted[assetField].map(file => file.id);
  }else if(toBeDeleted[assetField]){
    assetsTobeDeleted = [toBeDeleted[assetField].id];
  }else{
    assetsTobeDeleted = [];
  }
  return assetsTobeDeleted.filter(id => !!id);
};

const createPromisified = (model, obj) => {
  const method = 'create';
  return promisify(model, method, obj);
};

const findByIdPromisified = (model, id) => {
  const method = 'findById';
  return promisify(model, method, id);
};

const destroyByIdPromisified = (model, id) => {
  const method = 'destroyById';
  return promisify(model, method, id);
};

const removeFilePromisified = (model, container, filename) => {
  const method = 'removeFile';
  return promisify(model, method, container, filename);
};

const promisify = (model, method, ...args) => {
  return new Promise((resolve, reject) => {
    model[method].apply(model, [...args, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }]);
  });
};

module.exports = {
  collectAssetsTobeDeleted,
  createPromisified,
  findByIdPromisified,
  destroyByIdPromisified,
  removeFilePromisified,
}
  