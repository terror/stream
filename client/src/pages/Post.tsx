import { Box, Center, Spinner, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert } from '../components/Alert';
import { Layout } from '../components/Layout';
import { NotFound } from '../components/NotFound';
import { Post as PostComponent } from '../components/Post';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';

export const Post = () => {
  const params = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [alert, setAlert] = useState<{
    status: 'info' | 'warning' | 'success' | 'error' | 'loading' | undefined;
    content: string;
  }>({ status: undefined, content: '' });

  const [post, setPost] = useState<PostType | undefined | null>(undefined);
  const [key, setKey] = useState(0);

  useEffect(() => {
    fetchClient
      .deserialize<PostType>('GET', `/posts/${params.id}`)
      .then((data) => setPost(data))
      .catch((err: any) =>
        setAlert({ status: 'error', content: err.toString() })
      );
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

  if (post === null) {
    return <NotFound />;
  }

  const remountAlert = () => setKey(key + 1);

  const handleUpdate = async (model: PostType, data: any) => {
    try {
      remountAlert();
      setPost(
        await fetchClient.deserialize<PostType>('PUT', '/posts', {
          _id: model?._id,
          timestamp: model?.timestamp,
          ...data,
        })
      );
      setAlert({ status: 'success', content: 'Updated post successfully' });
    } catch (err: any) {
      setAlert({ status: 'error', content: err.toString() });
    }
  };

  const handleDelete = async (model: PostType) => {
    try {
      remountAlert();
      await fetchClient.delete(`/posts?id=${model._id}`);
      setPost(null);
      setAlert({ status: 'success', content: 'Deleted post successfully' });
    } catch (err: any) {
      setAlert({ status: 'error', content: err.toString() });
    }
  };

  return (
    <Layout>
      <Stack p='4'>
        {post && (
          <PostComponent
            post={post}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onTagClick={(tag) => navigate(`/?q=${encodeURIComponent(tag)}`)}
          />
        )}
      </Stack>
      <Box>
        {alert.status && (
          <Alert key={key} status={alert.status} content={alert.content} />
        )}
      </Box>
    </Layout>
  );
};
