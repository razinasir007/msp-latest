import React, { useState, useEffect } from 'react';
import { Alert, AlertIcon, Slide, AlertProps } from "@chakra-ui/react";

export interface Props {
    message?: string
    index?: number
    slideDirection?: "top" | "bottom" | "left" | "right" // New slideDirection prop
    position?: string,
    options?: AlertProps
    onDisplay?: Function
    onComplete?: Function
}

const defaultProps: Props = {
    message: "Success!",
    index: 0,
    position: "bottom-right", 
    slideDirection: "right",
    options: {
        status: "success", 
        maxWidth: "300px",
    }
}

// export function ChakraAlert(initialProps: Props) {

//     // merge in the default values into the props
//     const props = { 
//         ...defaultProps, 
//         ...initialProps, 
//         options: { 
//             ...defaultProps.options, 
//             ...initialProps.options 
//         }
//     };

//     const [isVisible, setIsVisible] = useState(false);

//     // const getPositionProps = (position) => {
//     //     switch (position) {
//     //         case 'top-left': return { top: '10px', left: '10px' };
//     //         case 'top-right': return { top: '10px', right: '10px' };
//     //         case 'bottom-left': return { bottom: '10px', left: '10px' };
//     //         case 'bottom-right': default: return { bottom: '10px', right: '10px' };
//     //     }
//     // };

//     const getPositionProps = (position, index) => {
//         const baseOffset = 10; 
//         const alertHeight = 40; // This is an estimation. Adjust based on your alert's height.
//         const totalOffset = baseOffset + (alertHeight + 15) * index; // 15 is the spacing you wanted between alerts.
    
//         switch (position) {
//             case 'top-left': return { top: `${totalOffset}px`, left: '10px' };
//             case 'top-right': return { top: `${totalOffset}px`, right: '10px' };
//             case 'bottom-left': return { bottom: `${totalOffset}px`, left: '10px' };
//             case 'bottom-right': default: return { bottom: `${totalOffset}px`, right: '10px' };
//         }
//     };
    
//     useEffect(() => {
//         // Start by sliding in
//         const slideInTimer = setTimeout(() => {
//             setIsVisible(true);
//             props.onDisplay && props.onDisplay();
//         }, 0);

//         // Then slide out after 3 seconds
//         const slideOutTimer = setTimeout(() => {
//             setIsVisible(false);
//             props.onComplete && props.onComplete();
//         }, 4500);

//         // Cleanup the timers when component is unmounted
//         return () => {
//             clearTimeout(slideInTimer);
//             clearTimeout(slideOutTimer);
//         };
//     }, []);

//     return (
//         <Slide direction={props.slideDirection} in={isVisible}>
//             <Alert
//                 status={props.options?.status}
//                 // position="relative"
//                 // maxWidth={props.options?.maxWidth}
//                 // {...getPositionProps(props?.position, props?.index)}
//             >
//                 <AlertIcon />
//                 {props?.message}
//             </Alert>
//         </Slide>
//     );
// }
