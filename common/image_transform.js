const gm = require('gm');
const fs = require('fs');

const MAX_IMAGE_WIDTH = 800;

const promisify = (gm, method, ...args) => {
  return new Promise((resolve, reject) => {
    gm[method].apply(gm, [...args, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }]);
  });
};

const reformatImage = async (fileInfo) => {
  const image = gm(`${fileInfo.path}${fileInfo.name}`);

  try{
    const identity = await promisify(image, 'identify');
    if(identity.size.width > MAX_IMAGE_WIDTH || identity.format !== 'JPEG') {
      const reformatted = {name: fileInfo.name};
      let newImage = image;
      if(identity.size.width > MAX_IMAGE_WIDTH){
        newImage = newImage.resize(MAX_IMAGE_WIDTH);
      }
      {
        const i1 = reformatted.name.lastIndexOf('.');
        reformatted.name = reformatted.name.substring(0, i1) + '-e.jpeg';
      }

      const newFullPathImage = `${fileInfo.path}${reformatted.name}`;
      await promisify(newImage, 'write', newFullPathImage);

      var stats = fs.statSync(newFullPathImage);
      reformatted.size = stats.size;
      reformatted.type = 'image/jpeg';

      return reformatted;
    }
  }catch(err){
    console.log(err);
  }
}

//reformatImage({path: '/home/kayvan/Pictures/', name: 'Screenshot from 2018-09-11 07-47-35.png'});
// reformatImage({path: '/home/kayvan/Pictures/personal/', name: '20180716_174239.jpg'});

module.exports = {
  reformatImage
};
