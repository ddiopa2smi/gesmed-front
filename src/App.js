import React, { useContext } from 'react';
import './App.scss';
import "./../node_modules/antd/dist/antd";
import "./../node_modules/antd/dist/antd.min.js"; 
import "./../node_modules/antd/dist/reset.css";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider, theme} from 'antd';
import { PRIMARY_COLOR } from './constants/app.constants.js';
import { ThemeContext } from './utils/providers/ThemeProvider.js';
import { router } from './AppRouting.js';
import { AbilityContext } from './utils/contexts/AbilityContext.js';
import { ability } from './utils/access.js';


function App() {

  //const currentTheme = useSelector((state)=>state.themeRdx.currentTheme);
  const {isDark} = useContext(ThemeContext);
  // const {currentTheme} = useContext(ThemeContext);

  return (
      <ConfigProvider 
        theme={{
            //algorithm : currentTheme,
            algorithm : isDark ? theme.darkAlgorithm : theme.defaultAlgorithm ,
            token : {
              colorPrimary : PRIMARY_COLOR ,
              borderRadius : 6,
              
            },
            components : {
              Segmented : {
                itemSelectedBg : PRIMARY_COLOR ,
                itemSelectedColor : '#ffff'
              }
            }
        }}
      >
        <div className="App">
          <AbilityContext.Provider value={ability} >
            <RouterProvider router={router} />
          </AbilityContext.Provider>
        </div>
      </ConfigProvider>
  );
}

export default App;
