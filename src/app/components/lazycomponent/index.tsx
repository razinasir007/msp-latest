import React, { ComponentType, lazy, Suspense } from 'react';
import { Center, Spinner, Stack, Box, Card, CardBody, Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

export function lazyWithSuspense(importFunction: () => Promise<any>) {
  const LazyComponent = lazy(importFunction);
  return withSuspense(LazyComponent);
}

function LoadingScreen() {
  return (
    <Center height="100vh" zIndex='1000'>
      <Spinner
        ml='3'
        thickness='4px'
        speed='1.0s'
        emptyColor='gray.200'
        color='blue.500'
        size='lg'
      />         
    </Center>
  )
}

function withSuspense(WrappedComponent: ComponentType) {
  return (props: any) => (
    <Suspense fallback={<LoadingScreen />}>
      <WrappedComponent {...props} />
    </Suspense>
  );
}