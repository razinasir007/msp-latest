import { State } from "@hookstate/core";
import { AppState, UploadedBase64 } from "./interfaces";

export function setSound(state: State<AppState>) {
  return (value: boolean) => {
    state.slideShow.sound.set(value);
  };
}
export function getSound(state: State<AppState>) {
  return () => state.slideShow.sound.get();
}
export function setContent(state: State<AppState>) {
  return (value: boolean) => {
    state.slideShow.content.set(value);
  };
}
export function getContent(state: State<AppState>) {
  return () => state.slideShow.content.get();
}
export function removeAudio(state: State<AppState>) {
  return (audio: UploadedBase64) => {
    state.uploadedAudios.set((previous) => {
      return previous.filter((tempAudio) => tempAudio.id !== audio.id);
    });
  };
}

export function addAudios(state: State<AppState>) {
  return (audios) => {
    state.uploadedAudios.set((previous) => [...previous, ...audios]);
  };
}

export function getAudios(state: State<AppState>) {
  return () => {
    return state.uploadedAudios.get();
  };
}

export function setWatermark(state: State<AppState>) {
  return (watermark) => {
    state.watermark.set(watermark);
  };
}

export function getWatermarkText(state: State<AppState>) {
  return () => {
    return state.watermark.get();
  };
}