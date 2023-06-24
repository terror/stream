import { Box, Center, Spinner, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Alert } from '../components/Alert';
import { Layout } from '../components/Layout';
import { Post as PostComponent } from '../components/Post';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';

export const Post = () => {
  const params = useParams<{ id: string }>();

  const [alert, setAlert] = useState<{
    status: 'info' | 'warning' | 'success' | 'error' | 'loading' | undefined;
    content: string;
  }>({ status: undefined, content: '' });

  const [post, setPost] = useState<PostType | undefined | null>(undefined);
  const [key, setKey] = useState(0);

  useEffect(() => {
    fetchClient
      .deserialize<PostType>('GET', `/posts/${params.id}`)
      .then((post) => setPost(post))
      .catch((err) => console.log(err));
  }, []);

  if (post === undefined) {
    return (
      <Layout>
        <Center mt='4'>
          <Spinner />
        </Center>
      </Layout>
    );
  }

  const remountAlert = () => setKey(key + 1);

  const handleUpdate = async (post: PostType, data: any) => {
    try {
      remountAlert();
      setPost(
        await fetchClient.deserialize<PostType>('PUT', '/posts', {
          _id: post?._id,
          timestamp: post?.timestamp,
          ...data,
        })
      );
      setAlert({ status: 'success', content: 'Updated post successfully' });
    } catch (err: any) {
      setAlert({ status: 'error', content: err.toString() });
    }
  };

  const handleDelete = async (post: PostType) => {
    try {
      remountAlert();
      await fetchClient.delete(`/posts?id=${post._id}`);
      setPost(null);
      setAlert({ status: 'success', content: 'Deleted post successfully' });
    } catch (err: any) {
      setAlert({ status: 'error', content: err.toString() });
    }
  };

  return (
    <Layout>
      {post === null ? (
        <Center fontWeight='bold' fontSize='2xl'>
          No post found for id {params.id}
        </Center>
      ) : (
        <Stack p='4'>
          {post && (
            <PostComponent
              post={post}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </Stack>
      )}
      <Box>
        {alert.status && (
          <Alert key={key} status={alert.status} content={alert.content} />
        )}
      </Box>
    </Layout>
  );
};
