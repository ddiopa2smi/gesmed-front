import { notification } from 'antd';
import React from 'react'

export const NotificationContext = createContext();
function NotificationProvider() {
    const [api , contextHolder] = notification.useNotification();
  return (
    <NotificationContext.Provider value={{ api}}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider