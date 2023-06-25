import { AlertIcon, Alert as ChakraAlert, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const Alert = ({
  status,
  content,
}: {
  status?: 'info' | 'warning' | 'success' | 'error' | 'loading';
  content: string;
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
  };

  const alertStyles = {
    opacity: show ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  return (
    <ChakraAlert
      borderRadius='lg'
      bottom='0'
      cursor='pointer'
      m='5'
      maxW='300px'
      onClick={handleClose}
      position='fixed'
      right='0'
      status={status}
      style={alertStyles}
    >
      <AlertIcon />
      <Text>{content}</Text>
    </ChakraAlert>
  );
};
