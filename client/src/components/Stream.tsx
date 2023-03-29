import {
  Flex,
  Button,
  Heading,
  Input,
  Stack,
  useColorMode,
} from '@chakra-ui/react';

import { useAuth } from '../hooks/useAuth';

export const Stream = () => {
  const { colorMode } = useColorMode();

  const user = useAuth();

  return (
    <Stack p='4'>
      <Flex alignItems='center'>
        <Heading>Liam's stream</Heading>
        {user && (
          <Button
            mt='2'
            ml='2'
            size='sm'
            background={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          >
            +
          </Button>
        )}
      </Flex>
      <Input
        placeholder='Search the stream...'
        fontWeight='medium'
        border='none'
        outline='none'
        background={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        _focus={{ boxShadow: 'none' }}
      />
    </Stack>
  );
};
