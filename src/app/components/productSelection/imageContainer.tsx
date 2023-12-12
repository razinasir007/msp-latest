import React from "react";
import { Center, Image } from "@chakra-ui/react";

interface Props extends React.HTMLAttributes<HTMLImageElement> {
  src: string;
  imageAttr?: React.HTMLAttributes<HTMLImageElement>;
  children?: any;
}

// This Component ensures that the image is centered and fills the given container.
export function ImageContainer(props: Props) {
  const { src, imageAttr, children } = props;

  return (
    <Center
      alignItems='center'
      justifyContent='center'
      height={"100%"}
      width={"100%"}
      padding={0}
      bg='white'
    >
      <Image maxHeight='100%' maxWidth='100%' src={src} {...imageAttr} />
      {children}
    </Center>
  );
}
