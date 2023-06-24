import { CloseIcon } from '@chakra-ui/icons';
import {
  AlertIcon,
  Alert as ChakraAlert,
  IconButton,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const Alert = ({
  status,
  content,
}: {
  status?: 'info' | 'warning' | 'success' | 'error' | 'loading';
  content: string;
}) => {
  const { colorMode } = useColorMode();

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

  const closeButtonStyles = {
    top: '50%',
    transform: 'translateY(-50%)',
    right: '4px',
    padding: '0',
    fontSize: '12px',
    color: colorMode === 'dark' ? 'white' : 'black',
    _hover: { background: 'none', color: 'gray.500' },
  };

  return (
    <ChakraAlert
      status={status}
      borderRadius='lg'
      position='fixed'
      bottom='0'
      right='0'
      maxW='300px'
      style={alertStyles}
      m='5'
    >
      <AlertIcon />
      <Text>{content}</Text>
      <IconButton
        icon={<CloseIcon />}
        position='absolute'
        aria-label='Close'
        variant='ghost'
        onClick={handleClose}
        {...closeButtonStyles}
      />
    </ChakraAlert>
  );
};
