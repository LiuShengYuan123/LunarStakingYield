import React from 'react'
import { ConfigProvider,theme } from 'antd';


export const AntDesignConfigProvider = ({children}:{children: React.ReactNode}) => {
  return (
    <ConfigProvider theme={{algorithm: theme.darkAlgorithm}} >
        {children}
    </ConfigProvider>
  )
}



