import { Image } from "image-js";

export const getFrameThickness = async (frameDataURL, debug = false) => {
  try {
    const image = await Image.load(frameDataURL);

    let { width, height } = image;

    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // Initial colorDiff threshold
    let colorDiffThreshold = 20;

    let thickness = 0;

    while (true) {
      let leftThickness = 0;
      let topThickness = 0;
      let rightThickness = 0;
      let bottomThickness = 0;

      // Estimate left thickness
      for (let x = centerX; x >= 1; x--) {
        if (
          isColorChange(image, x, centerY, x - 1, centerY, colorDiffThreshold)
        ) {
          leftThickness = centerX - x;
          break;
        }
      }

      // Estimate top thickness
      for (let y = centerY; y >= 1; y--) {
        if (
          isColorChange(image, centerX, y, centerX, y - 1, colorDiffThreshold)
        ) {
          topThickness = centerY - y;
          break;
        }
      }

      // Estimate right thickness
      for (let x = centerX; x <= width - 2; x++) {
        if (
          isColorChange(image, x, centerY, x + 1, centerY, colorDiffThreshold)
        ) {
          rightThickness = x - centerX;
          break;
        }
      }

      // Estimate bottom thickness
      for (let y = centerY; y <= height - 2; y++) {
        if (
          isColorChange(image, centerX, y, centerX, y + 1, colorDiffThreshold)
        ) {
          bottomThickness = y - centerY;
          break;
        }
      }

      thickness = Math.round(
        (leftThickness + topThickness + rightThickness + bottomThickness) / 4
      );

      // If the thickness is less than 7% of the smaller image dimension, increase the threshold and try again
      if (thickness < Math.min(width, height) * 0.07) {
        colorDiffThreshold += 1;
      } else {
        break;
      }

      // Base case: exit if the thickness is more than 15% of the image's smaller dimension
      if (thickness > Math.min(width, height) * 0.15) {
        // console.log('Could not find suitable threshold. Exiting...');
        return null;
      }
    }

    if (debug) {
      console.log("dimensions: ", { width, height });
      console.log("Thickness: ", thickness);
    }

    return thickness;
  } catch (error) {
    console.log("Error:::", error);
  }
};

// sampling
const isColorChange = (image, x1, y1, x2, y2, colorDiffThreshold, n = 10) => {
  const pixelData1 = image.getPixel(x1, y1);
  const pixelData2 = image.getPixel(x2, y2);

  const colorDiff = pixelData1
    .slice(0, 3)
    .map((value, index) => Math.abs(value - pixelData2[index]))
    .reduce((sum, diff) => sum + diff, 0);

  const alphaChange = Math.abs(pixelData1[3] - pixelData2[3]);

  if (alphaChange > 0) {
    // Determine the direction to check based on the direction of the original change
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Track the current layer: true for transparent, false for non-transparent
    let isTransparent = pixelData2[3] === 0;
    let transparentLayers = isTransparent ? 1 : 0;

    // Check every nth pixel in the same direction
    for (let i = n; i < image.width; i += n) {
      const nextX = x2 + i * dx;
      const nextY = y2 + i * dy;

      // Ensure the next pixel is within the image bounds
      if (
        nextX < 0 ||
        nextX >= image.width ||
        nextY < 0 ||
        nextY >= image.height
      ) {
        break;
      }

      const nextPixelData = image.getPixel(nextX, nextY);
      const nextIsTransparent = nextPixelData[3] === 0;

      if (nextIsTransparent !== isTransparent) {
        // If we're transitioning to or from a transparent layer, update our tracking variables
        isTransparent = nextIsTransparent;
        if (isTransparent) {
          transparentLayers++;
        }

        // If we've encountered the second fully transparent layer, stop and consider it a color change
        if (transparentLayers === 2) {
          return true;
        }
      }
    }
  }

  return colorDiff > colorDiffThreshold || alphaChange > 0; // Adjust these threshold values as needed
};

// const calculateImageColorStats = (image) => {
//   let total = [0, 0, 0];
//   let totalSq = [0, 0, 0];
//   let pixelCount = 0;

//   for (let y = 0; y < image.height; y++) {
//     for (let x = 0; x < image.width; x++) {
//       const pixelData = image.getPixel(x, y);
//       for (let i = 0; i < 3; i++) {
//         total[i] += pixelData[i];
//         totalSq[i] += pixelData[i] * pixelData[i];
//       }
//       pixelCount++;
//     }
//   }

//   const means = total.map(t => t / pixelCount);
//   const stdevs = totalSq.map((tSq, i) => Math.sqrt(tSq / pixelCount - means[i] ** 2));

//   return { means, stdevs };
// };

// const {means, stdevs} = calculateImageColorStats(image);

const isColorChange2 = (image, x1, y1, x2, y2) => {
  const pixelData1 = image.getPixel(x1, y1);
  const pixelData2 = image.getPixel(x2, y2);

  const colorDiff = pixelData1
    .slice(0, 3)
    .map((value, index) => Math.abs(value - pixelData2[index]))
    .reduce((sum, diff) => sum + diff, 0);

  const alphaChange = Math.abs(pixelData1[3] - pixelData2[3]);

  if (alphaChange > 0) {
    // Determine the direction to check based on the direction of the original change
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Check the next 10 pixels in the same direction to see if they're also transparent
    for (let i = 1; i <= 10; i++) {
      const nextX = x2 + i * dx;
      const nextY = y2 + i * dy;

      // Ensure the next pixel is within the image bounds
      if (
        nextX < 0 ||
        nextX >= image.width ||
        nextY < 0 ||
        nextY >= image.height
      ) {
        return false;
      }

      const nextPixelData = image.getPixel(nextX, nextY);
      if (nextPixelData[3] !== 0) {
        // If any of the next 10 pixels are not fully transparent, return false
        return false;
      }
    }
  }

  return colorDiff > 25 || alphaChange > 0; // Adjust these threshold values as needed
};

function isSquareLike(width: number, height: number): boolean {
  const errorMargin = 0.15;
  const aspectRatio = width / height;
  const squareAspectRatio = 1;

  const lowerBound = squareAspectRatio - squareAspectRatio * errorMargin;
  const upperBound = squareAspectRatio + squareAspectRatio * errorMargin;

  return aspectRatio >= lowerBound && aspectRatio <= upperBound;
}

export function adjustFrameDimensions(
  frameWidth: number,
  frameHeight: number,
  frameThickness: number,
  targetWidth: number,
  targetHeight: number
): { width: number; height: number } {
  // Calculate the initial inner dimensions of the frame
  let innerWidth = frameWidth - 2 * frameThickness;
  let innerHeight = frameHeight - 2 * frameThickness;

  // Check if the frame thickness is larger than the target dimensions
  if (innerWidth <= 0 || innerHeight <= 0) {
    throw new Error("Frame thickness is larger than the target dimensions");
  }

  // Check if the frame needs to be rotated
  if (
    (targetWidth > targetHeight && frameWidth < frameHeight) ||
    (targetHeight > targetWidth && frameHeight < frameWidth)
  ) {
    [frameWidth, frameHeight] = [frameHeight, frameWidth];
    [innerWidth, innerHeight] = [innerHeight, innerWidth];
  }

  // Determine the determining dimension
  let determiningDimension = targetWidth > targetHeight ? "width" : "height";
  let scaleRatio;

  // Adjust the determining dimension and the other dimension proportionally
  if (determiningDimension === "width") {
    scaleRatio = (targetWidth / innerWidth) * 1.1; // 5% padding
    frameWidth *= scaleRatio;
    frameHeight *= scaleRatio;
  } else {
    // 'height'
    scaleRatio = (targetHeight / innerHeight) * 1.1; // 5% padding
    frameHeight *= scaleRatio;
    frameWidth *= scaleRatio;
  }

  // Adjust the frame thickness
  frameThickness *= scaleRatio;

  return {
    width: frameWidth,
    height: frameHeight,
  };
}

// export function adjustFrameDimensions(
//     frameWidth: number,
//     frameHeight: number,
//     frameThickness: number,
//     targetWidth: number,
//     targetHeight: number
//   ): { width: number, height: number } {

//     // Calculate the initial inner dimensions of the frame
//     let innerWidth = frameWidth - 2 * frameThickness;
//     let innerHeight = frameHeight - 2 * frameThickness;

//     // Check if the frame thickness is larger than the target dimensions
//     if (innerWidth <= 0 || innerHeight <= 0) {
//       throw new Error("Frame thickness is larger than the target dimensions");
//     }

//     // Check if the frame needs to be rotated
//     if ((targetWidth > targetHeight && frameWidth < frameHeight) ||
//         (targetHeight > targetWidth && frameHeight < frameWidth)) {
//       [frameWidth, frameHeight] = [frameHeight, frameWidth];
//       [innerWidth, innerHeight] = [innerHeight, innerWidth];
//     }

//     // Scaling factor, here we're using 0.5% scale down per step
//     const scaleDownFactor = 0.005;

//     // Iteratively scale down the frame dimensions and thickness until the inner dimensions are as close as possible to the target dimensions
//     while (true) {
//       // Calculate the next frame dimensions
//       let nextFrameWidth = frameWidth * (1 - scaleDownFactor);
//       let nextFrameHeight = frameHeight * (1 - scaleDownFactor);
//       // Thickness scales down in the same ratio as the frame dimensions
//       let nextFrameThickness = frameThickness * (nextFrameWidth / frameWidth);
//       console.log({nextFrameThickness})
//       // Calculate next inner dimensions
//       let nextInnerWidth = nextFrameWidth - 2 * nextFrameThickness;
//       let nextInnerHeight = nextFrameHeight - 2 * nextFrameThickness;

//       // Break if the next step will make inner dimensions smaller than the target
//       if (nextInnerWidth < targetWidth || nextInnerHeight < targetHeight) {
//         break;
//       }

//       // Update frame dimensions and thickness
//       frameWidth = nextFrameWidth;
//       frameHeight = nextFrameHeight;
//       frameThickness = nextFrameThickness;
//     }

//     return {
//       width: frameWidth * 1.15,
//       height: frameHeight * 1.15,
//     };
//   }

// export function adjustFrameDimensions(
//   frameWidth: number,
//   frameHeight: number,
//   frameThickness: number,
//   targetWidth: number,
//   targetHeight: number
// ): { width: number, height: number } {

//   // Calculate the initial inner dimensions of the frame
//   let innerWidth = frameWidth - 2 * frameThickness;
//   let innerHeight = frameHeight - 2 * frameThickness;

//   // Check if the frame thickness is larger than the target dimensions
//   if (innerWidth <= 0 || innerHeight <= 0) {
//     throw new Error("Frame thickness is larger than the target dimensions");
//   }

//   // Check if the frame needs to be rotated
//   if ((targetWidth > targetHeight && frameWidth < frameHeight) ||
//       (targetHeight > targetWidth && frameHeight < frameWidth)) {
//     [frameWidth, frameHeight] = [frameHeight, frameWidth];
//     [innerWidth, innerHeight] = [innerHeight, innerWidth];
//   }

//   // Determine the determining dimension
//   let determiningDimension = targetWidth > targetHeight ? 'width' : 'height';
//   let scaleRatio;

//   // Adjust the determining dimension and the other dimension proportionally
//   if (determiningDimension === 'width') {
//     scaleRatio = targetWidth / innerWidth * 1.05; // 5% padding
//     frameWidth *= scaleRatio;
//     frameHeight *= scaleRatio;
//   } else { // 'height'
//     scaleRatio = targetHeight / innerHeight * 1.05; // 5% padding
//     frameHeight *= scaleRatio;
//     frameWidth *= scaleRatio;
//   }

//   // Adjust the frame thickness
//   frameThickness *= scaleRatio;
//   console.log({frameThickness})
//   return {
//     width: frameWidth,
//     height: frameHeight,
//   };
// }

// export function adjustFrameDimensions(
//   frameWidth: number,
//   frameHeight: number,
//   frameThickness: number,
//   targetWidth: number,
//   targetHeight: number
// ): { width: number, height: number } {

//   // Calculate the initial inner dimensions of the frame
//   let innerWidth = frameWidth - 2 * frameThickness;
//   let innerHeight = frameHeight - 2 * frameThickness;

//   // Check if the frame thickness is larger than the target dimensions
//   if (innerWidth <= 0 || innerHeight <= 0) {
//     throw new Error("Frame thickness is larger than the target dimensions");
//   }

//   // Check if the frame needs to be rotated
//   if ((targetWidth > targetHeight && frameWidth < frameHeight) ||
//       (targetHeight > targetWidth && frameHeight < frameWidth)) {
//     [frameWidth, frameHeight] = [frameHeight, frameWidth];
//     [innerWidth, innerHeight] = [innerHeight, innerWidth];
//   }

//   // Determine the determining dimension
//   let determiningDimension = targetWidth > targetHeight ? 'width' : 'height';
//   let scaleRatio;

//   // Calculate the lower and upper bounds of the frame dimensions, then set the actual dimensions to the average
//   if (determiningDimension === 'width') {
//     scaleRatio = targetWidth / innerWidth;
//     let lowerBoundWidth = frameWidth * scaleRatio;
//     let upperBoundWidth = lowerBoundWidth + 2.5 * (frameThickness * scaleRatio);
//     frameWidth = (lowerBoundWidth + upperBoundWidth) / 2;
//     frameHeight *= (frameWidth / frameHeight);
//   } else { // 'height'
//     scaleRatio = targetHeight / innerHeight;
//     let lowerBoundHeight = frameHeight * scaleRatio;
//     let upperBoundHeight = lowerBoundHeight + 2.5 * (frameThickness * scaleRatio);
//     frameHeight = (lowerBoundHeight + upperBoundHeight) / 2;
//     frameWidth *= (frameHeight / frameWidth);
//   }

//   // Adjust the frame thickness
//   frameThickness *= scaleRatio;

//   return {
//     width: frameWidth * 1,
//     height: frameHeight * 1,
//   };
// }
