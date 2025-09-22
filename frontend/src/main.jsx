import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'
import ShopContextProvider from './context/ShopContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <ShopContextProvider>
          <App />
        </ShopContextProvider>
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
);

