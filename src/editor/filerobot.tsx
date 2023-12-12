import React, { useState } from "react";
import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from "react-filerobot-image-editor";
import { UploadedPhoto } from "../state/interfaces";
import { useGlobalState } from "../state/store";

export function FilerobotVewer(image) {
  const state = useGlobalState();

  function createElement(image) {
    return image !== undefined
      ? image.base64
      : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }

  let config = {
    source: createElement(image),
    closeAfterSave: true,
    onBeforeSave: (x) => {
      console.log(x);
    },
    onSave: (editedImageObject, designState) => {
      // console.log('saved', editedImageObject)
      const updated: UploadedPhoto = {
        ...image,
        filename: editedImageObject.fullName,
        base64: editedImageObject.imageBase64,
        type: editedImageObject.mimeType,
      };
      // console.log("updated", updated)
      state.updateImage(image, updated);

      // image.base64.set(editedImageObject.imageSrc)
      return false; // prevent us from saving image to local computer
    },
    // onClose={closeImgEditor}
    annotationsCommon: {
      fill: "#ff0000",
    },
    // Text={{ text: 'Filerobot...' }}
    // tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK]} // or {['Adjust', 'Annotate', 'Watermark']}
    // defaultTabId={TABS.ANNOTATE} // or 'Annotate'
    // defaultToolId={TOOLS.TEXT} // or 'Text'
  };

  return (
    <div style={{ maxHeight: "100%" }}>
      <FilerobotImageEditor {...config} />
    </div>
  );
}
