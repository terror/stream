import { Stack } from '@chakra-ui/react';

import { Navbar } from './Navbar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack maxW='860px' m='auto'>
      <Navbar />
      {children}
    </Stack>
  );
};
