// AlertContext.tsx
import React, { createContext, useContext } from 'react';
import { Props as AlertProps } from './chakraAlert';

interface AlertContextType {
    addAlert: (alertProps: AlertProps) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlert must be used within a AlertProvider');
    }
    return context;
};

export default AlertContext;
