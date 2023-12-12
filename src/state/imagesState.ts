import { State } from "@hookstate/core";
import { AppState, UploadedPhoto } from "./interfaces";

export function addImages(state: State<AppState>) {
  return (images) => {
    state.uploadedImages.set((previous) => [...previous, ...images]);
  };
}
export function addImagesForClientView(state: State<AppState>) {
  return (images) => {
    state.clientImages.set((previous) => [...previous, ...images]);
  };
}
export function addOriImages(state: State<AppState>) {
  return (images) => {
    state.originalImages.set((previous) => [...previous, ...images]);
  };
}
export function addPresentationImages(state: State<AppState>) {
  return (images) => {
    state.presentationImages.set((previous) => [...previous, ...images]);
  };
}
export function addResizedImages(state: State<AppState>) {
  return (images) => {
    state.resizedImages.set((previous) => [...previous, ...images]);
  };
}

export function getImages(state: State<AppState>) {
  return () => state.uploadedImages.get();
}
export function getClientImages(state: State<AppState>) {
  return () => state.clientImages.get();
}
export function getOriImages(state: State<AppState>) {
  return () => state.originalImages.get();
}
export function getPresentationImages(state: State<AppState>) {
  return () => state.presentationImages.get();
}
export function getResizedImages(state: State<AppState>) {
  return () => state.resizedImages.get();
}

export function updateImage(state: State<AppState>) {
  return (original: UploadedPhoto, updated: UploadedPhoto) => {
    state.uploadedImages.set((previous) => {
      return previous.map((photo) => {
        if (photo.id === original.id) {
          return updated;
        }
        return photo;
      });
    });
  };
}
export function addCopiedImage(state: State<AppState>) {
  return (copiedImage: UploadedPhoto) => {
    state.uploadedImages.set((previous) => {
      // Create a new array with the copied image added to it
      return [...previous, copiedImage];
    });
  };
}
export function updateClientViewImage(state: State<AppState>) {
  return (original: UploadedPhoto, updated: UploadedPhoto) => {
    state.clientImages.set((previous) => {
      return previous.map((photo) => {
        if (photo.id === original.id) {
          return updated;
        }
        return photo;
      });
    });
  };
}
export function updateOriImage(state: State<AppState>) {
  return (original: UploadedPhoto, updated: UploadedPhoto) => {
    state.originalImages.set((previous) => {
      return previous.map((photo) => {
        if (photo.id === original.id) {
          return updated;
        }
        return photo;
      });
    });
  };
}

export function updatePresentationImage(state: State<AppState>) {
  return (original: UploadedPhoto, updated: UploadedPhoto) => {
    state.presentationImages.set((previous) => {
      return previous.map((photo) => {
        if (photo.id === original.id) {
          return updated;
        }
        return photo;
      });
    });
  };
}

export function getSelectedImages(state: State<AppState>) {
  return () => {
    return state.selectedImages.get();
  };
}

export function setSelectedImages(state: State<AppState>) {
  return (photos: UploadedPhoto[]) => {
    return state.selectedImages.set(photos);
  };
}
