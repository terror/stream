import { Stack } from '@chakra-ui/react';

import { Navbar } from './components/Navbar';
import { Stream } from './components/Stream';

const App = () => {
  return (
    <Stack maxW='860px' m='auto'>
      <Navbar />
      <Stream />
    </Stack>
  );
};

export default App;
