// AlertManager.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { Props as AlertProps } from './chakraAlert';
import AlertContext from './alertContext';
import { Alert, AlertIcon, Box, SlideFade, VStack } from '@chakra-ui/react';

interface AlertManagerProps {
    children: ReactNode;
    maxAlerts?: number;
}

export const AlertManager: React.FC<AlertManagerProps> = ({ children, maxAlerts = 3 }) => {
    const [alerts, setAlerts] = useState<AlertProps[]>([]);

    const addAlert = (alertProps: AlertProps) => {
        setAlerts(prevAlerts => [...prevAlerts, alertProps]);
    };

    const removeAlert = () => {
        setAlerts(prevAlerts => prevAlerts.slice(1));
    };

    useEffect(() => {
        if (alerts.length > 0) {
            const removalInterval = setInterval(() => {
                removeAlert();
            }, 4500); // 4500ms is the time after which an alert disappears

            return () => {
                clearInterval(removalInterval);
            };
        }
    }, [alerts]);

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {children}
            <VStack
                // spacing='15px'
                style={{
                    position: 'fixed',
                    bottom: 10, // Change from `top: 0` to `bottom: 0`
                    right: 10,
                    overflow: 'hidden',
                    zIndex: 1000  // To ensure the alerts are always on top of other content
            }}
            >
                {alerts.slice(0, maxAlerts).map((alertProps, index) => (
                    <Box key={index} width={"100%"}>
                        <SlideFade in={true}>
                            <Alert status={alertProps?.options?.status} variant='subtle'>
                                <AlertIcon />
                                {alertProps.message}
                            </Alert>
                        </SlideFade>
                    </Box>
                ))}
            </VStack>
        </AlertContext.Provider>
    );
};