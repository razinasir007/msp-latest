export interface ProductSelectionState {
  imageId: string;
  width: number;
  length: number;

  pixelRatio: number;
  sliderValue: number;
  inchesLength: number;
}

export const defaultValue: ProductSelectionState = {
  imageId: "",
  width: 3,
  length: 5,

  pixelRatio: 30,
  sliderValue: 0,
  inchesLength: 0,
};
