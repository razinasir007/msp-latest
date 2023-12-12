import { State } from "@hookstate/core";
import { AppState } from "./interfaces";

export function setInputValueThumbnailLabels(state: State<AppState>) {
  return (value: string) => {
    state.screenCalibrations.thumbnailLabelFontSize.set(value);
  };
}

export function getInputValueThumbnailLabels(state: State<AppState>) {
  return () => {
    return state.screenCalibrations.thumbnailLabelFontSize.get();
  };
}
export function setInputValueImageLabels(state: State<AppState>) {
  return (value: string) => {
    state.screenCalibrations.imageLabelFontSize.set(value);
  };
}

export function getInputValueImageLabels(state: State<AppState>) {
  return () => {
    return state.screenCalibrations.imageLabelFontSize.get();
  };
}

export function setFilenameExtension(state: State<AppState>) {
  return (value: boolean) => {
    state.screenCalibrations.filenameExtension.set(value);
  };
}

export function getFilenameExtension(state: State<AppState>) {
  return () => {
    return state.screenCalibrations.filenameExtension.get();
  };
}
