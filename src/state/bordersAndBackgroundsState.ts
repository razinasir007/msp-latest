import { State } from "@hookstate/core";
import { AppState } from "./interfaces";

export function setOpacity(state: State<AppState>) {
  return (value: number) => {
    state.bordersAndBackgrounds.opacity.set(value);
  };
}
export function getOpacity(state: State<AppState>) {
  return () => {
    return state.bordersAndBackgrounds.opacity.get();
  };
}
export function setSize(state: State<AppState>) {
  return (value: number) => {
    state.bordersAndBackgrounds.size.set(value);
  };
}
export function getSize(state: State<AppState>) {
  return () => {
    return state.bordersAndBackgrounds.size.get();
  };
}
export function setBackgroundColorForImage(state: State<AppState>) {
  return (value: string) => {
    state.bordersAndBackgrounds.backgroundColorforImage.set(value);
  };
}
export function getBackgroundColorForImage(state: State<AppState>) {
  return () => {
    return state.bordersAndBackgrounds.backgroundColorforImage.get();
  };
}
export function setInputValueImageBorders(state: State<AppState>) {
  return (value: string) => {
    state.bordersAndBackgrounds.imageBorder.set(value);
  };
}
export function getInputValueImageBorders(state: State<AppState>) {
  return () => {
    return state.bordersAndBackgrounds.imageBorder.get();
  };
}

export function setLayoutsOpening(state: State<AppState>) {
  return (value: boolean) => {
    state.bordersAndBackgrounds.layoutOpenings.set(value);
  };
}

export function getLayoutsOpening(state: State<AppState>) {
  return () => {
    return state.bordersAndBackgrounds.layoutOpenings.get();
  };
}
export function setToggle(state: State<AppState>) {
  return (value: boolean) => {
    state.bordersAndBackgrounds.toggle.set(value);
  };
}

export function getToggle(state: State<AppState>) {
  return () => {
    return state.bordersAndBackgrounds.toggle.get();
  };
}
export function setLayoutsThumbnails(state: State<AppState>) {
  return (value: boolean) => {
    state.bordersAndBackgrounds.layoutThumbnails.set(value);
  };
}

export function getLayoutsThumbnails(state: State<AppState>) {
  return () => {
    return state.bordersAndBackgrounds.layoutThumbnails.get();
  };
}
export function setFramesOpening(state: State<AppState>) {
  return (value: boolean) => {
    state.bordersAndBackgrounds.framesOpening.set(value);
  };
}

export function getFramesOpening(state: State<AppState>) {
  return () => {
    return state.bordersAndBackgrounds.framesOpening.get();
  };
}
