import {
  ChakraProvider,
  createStandaloneToast,
  extendTheme,
} from '@chakra-ui/react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './providers/AuthProvider';

export const { ToastContainer } = createStandaloneToast();

const theme = extendTheme({
  fonts: {
    body: `'Inter', sans-serif`,
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <React.StrictMode>
          <App />
          <ToastContainer />
        </React.StrictMode>
      </AuthProvider>
    </ChakraProvider>
  </BrowserRouter>
);
