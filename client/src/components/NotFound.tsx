import { Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <Stack align='center' justify='center' height='100vh'>
      <Text fontSize='4xl' fontWeight='bold'>
        404
      </Text>
      <Link to='/'>Return home</Link>
    </Stack>
  );
};
