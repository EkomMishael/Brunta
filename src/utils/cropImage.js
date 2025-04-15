import { createCanvas, loadImage } from 'canvas';

const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  try {
    const image = await loadImage(imageSrc);
    console.log('get them',image,'yoooo,',imageSrc)
    const canvas = createCanvas(pixelCrop.width, pixelCrop.height);
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.translate(pixelCrop.width / 2, pixelCrop.height / 2);
    ctx.rotate(rotation);
    ctx.translate(-pixelCrop.width / 2, -pixelCrop.height / 2);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    ctx.restore();

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Generated blob:', blob);
            console.log('Blob size:', blob.size, 'Blob type:', blob.type);
            
            const objectURL =blob;
            console.log('Object URL:', objectURL);
            resolve(objectURL);
          } else {
            console.error('Failed to create blob');
            reject('Failed to create blob');
          }
        }, 'image/jpeg'); // Specify JPEG MIME type
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      return null;
    }
  };
  
  export default getCroppedImg;