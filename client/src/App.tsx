import { Fragment } from 'react';

import {
  Flex,
  HStack,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';

const Navbar = () => {
  const { toggleColorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex p='4'>
      <Text fontWeight='bold'>
        <Link href='/'>the stream</Link>
      </Text>
      <HStack ml='auto'>
        <Link onClick={toggleColorMode} fontStyle='italic' as='div'>
          light/dark
        </Link>
        <Link fontWeight='bold' ml='auto' onClick={onOpen}>
          about
        </Link>
      </HStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>About</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb='2'>
            <Stack spacing='20px'>
              <Text>
                The 'stream' provides a serene abode for me to articulate my
                thoughts, unencumbered by the cacophonous clamor prevalent on
                platforms such as Twitter. My motivation to create this virtual
                sanctuary was kindled by the captivating essence of Linus Lee's
                stream, which can be savored at{' '}
                <Link href='https://stream.thesephist.com/' target='_blank'>
                  https://stream.thesephist.com/
                </Link>
                .
              </Text>
              <Text>
                Check out the code on GitHub:{' '}
                <Link href='https://github.com/terror/stream' target='_blank'>
                  https://github.com/terror/stream
                </Link>
              </Text>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

const Stream = () => {
  return (
    <Stack p='4'>
      <Heading>Liam's stream</Heading>
      <Input
        placeholder='Search the stream...'
        fontWeight='semibold'
        border='none'
        outline='none'
        background='#E2E8F0'
        _focus={{ boxShadow: 'none' }}
      />
    </Stack>
  );
};

const App = () => {
  return (
    <Fragment>
      <Navbar />
      <Stream />
    </Fragment>
  );
};

export default App;
