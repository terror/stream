import { Stack } from '@chakra-ui/react';

import { Navbar } from './Navbar';

interface LayoutProps {
  back?: boolean;
  children: React.ReactNode;
}

export const Layout = ({ back, children }: LayoutProps) => {
  return (
    <Stack maxW='860px' m='auto'>
      <Navbar back={back} />
      {children}
    </Stack>
  );
};
