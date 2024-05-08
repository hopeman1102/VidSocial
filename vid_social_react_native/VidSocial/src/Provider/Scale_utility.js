import { Dimensions, Platform, StatusBar, PixelRatio } from 'react-native';

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 360;
const guidelineBaseHeight = 690;


//const guidelineBaseWidth = 375;
// const guidelineBaseHeight = 812;

const { height, width } = Dimensions.get('window');

const standardLength = width > height ? width : height;

const offset =
  width > height ? 0 : Platform.OS === 'ios' ? 78 : StatusBar.currentHeight; // iPhone X style SafeAreaView size in portrait

const deviceHeight =
  Platform.OS === 'android' ? standardLength - offset : standardLength;

/**
 *  Will return a linear scaled
 *  result of the provided size,
 *  based on your device's screen width.
 * @param {number} size
 */
const scale = size => {
  let newSize = (width / guidelineBaseWidth) * size;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

/**
 *  Will return a linear scaled
 *  result of the provided size,
 *  based on your device's screen height.
 * @param {number} size
 */
const verticalScale = size => (height / guidelineBaseHeight) * size;

/**
 * will return scaled
 * result on basis of
 * factor provided
 * @param {number} size
 * @param {number} factor
 */
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 *
 * @param {number} fontSize
 * It will return fontsize
 * on basis of density of device
 */
const scaleFont = fontSize => {
  const heightPercent = (fontSize * deviceHeight) / guidelineBaseHeight;
  return Math.round(heightPercent);
};
const fullHeight = Math.round(Dimensions.get('window').height);
const fullWidth = Math.round(Dimensions.get('window').width);

export { scale, verticalScale, moderateScale, scaleFont, fullHeight, fullWidth };