import React, { useContext } from 'react';
import './App.scss';
import "./../node_modules/antd/dist/antd";
import "./../node_modules/antd/dist/antd.min.js";
import "./../node_modules/antd/dist/reset.css";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider, theme } from 'antd';
import { PRIMARY_COLOR, LOGO_BLUE } from './constants/app.constants.js';
import { ThemeContext } from './utils/providers/ThemeProvider.js';
import { router } from './AppRouting.js';
import { AbilityContext } from './utils/contexts/AbilityContext.js';
import { ability } from './utils/access.js';
import fr_FR from "antd/es/locale/fr_FR"
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");
function App() {

  //const currentTheme = useSelector((state)=>state.themeRdx.currentTheme);
  const { isDark } = useContext(ThemeContext);
  // const {currentTheme} = useContext(ThemeContext);

  return (
    <ConfigProvider
      locale={fr_FR}
      theme={{
        //algorithm : currentTheme,
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: PRIMARY_COLOR,
          borderRadius: 6,

        },
        components: {
          Segmented: {
            itemSelectedBg: PRIMARY_COLOR,
            itemSelectedColor: '#ffff'
          },
          Menu: {
            itemSelectedBg: PRIMARY_COLOR, // "hsl(145, 63%, 95%)",
            itemSelectedColor: "#fff",
            itemHeight: 35
          },
          Table: {
            headerBg: LOGO_BLUE,
            headerColor: '#ffffff',
            headerSortActiveBg: LOGO_BLUE,
            headerSortHoverBg: LOGO_BLUE,
            headerSplitColor: 'rgba(255, 255, 255, 0.3)',
            // Icônes de tri/recherche/filtre bien visibles sur le fond bleu de l'en-tête
            // (par défaut trop discrètes, calées sur colorIcon).
            headerIconColor: 'rgba(255, 255, 255, 0.85)',
            headerIconHoverColor: '#ffffff',
          },
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
