import {
  ChakraProvider,
  createStandaloneToast,
  extendTheme,
} from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import type { GlobalStyleProps } from '@chakra-ui/theme-tools';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './providers/AuthProvider';

const { ToastContainer } = createStandaloneToast();

const theme = extendTheme({
  config: { initialColorMode: 'dark', useSystemColorMode: true },
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        color: mode('gray.800', 'whiteAlpha.900')(props),
        bg: mode('gray.100', '#141214')(props),
      },
    }),
  },
  components: {
    Modal: {
      baseStyle: (props: GlobalStyleProps) => ({
        dialog: {
          color: mode('gray.800', 'whiteAlpha.900')(props),
          bg: mode('gray.100', '#141214')(props),
        },
      }),
    },
  },
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
