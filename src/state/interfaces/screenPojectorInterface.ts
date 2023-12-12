export interface screenCalibrations {
  thumbnailLabelFontSize: string;
  imageLabelFontSize: string;
  filenameExtension: boolean;
}

export const defaultValuesForScreenCalibrations: screenCalibrations = {
  thumbnailLabelFontSize: "",
  imageLabelFontSize: "",
  filenameExtension: false,
};
export interface bordersAndBackgrounds {
  size: number;
  opacity: number;
  backgroundColorforImage: string;
  toggle: boolean;
  imageBorder: string;
  layoutOpenings: boolean;
  layoutThumbnails: boolean;
  framesOpening: boolean;
}

export const defaultValuesForbordersAndBackgrounds: bordersAndBackgrounds = {
  size: 100,
  opacity: 1,
  backgroundColorforImage: "#000000",
  toggle: false,
  imageBorder: "",
  layoutOpenings: false,
  layoutThumbnails: false,
  framesOpening: false,
};
export interface slideShow {
  sound: boolean;
  content: boolean;
}

export const defaultValuesForSlideShow: slideShow = {
  sound: false,
  content: false,
};
