import { Center, Spinner, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { NotFound } from '../components/NotFound';
import { Post as PostComponent } from '../components/Post';
import { useDeleteModal } from '../hooks/useDeleteModal';
import { usePostActions } from '../hooks/usePostActions';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';

export const Post = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<PostType | undefined | null>(undefined);

  const {
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    isDeleteModalOpen,
    isDeleting,
  } = usePostActions(() => {
    navigate('/');
  });

  const { DeleteModal } = useDeleteModal();

  useEffect(() => {
    fetchClient
      .deserialize<PostType>('GET', `/posts/${params.id}`)
      .then((data) => setPost(data))
      .catch((err: any) => {
        console.error(err);
        setPost(null);
      });
  }, [params.id]);

  const handleUpdateWithState = async (model: PostType, data: any) => {
    const updatedPost = await handleUpdate(model, data);
    setPost(updatedPost);
  };

  if (post === undefined) {
    return (
      <Layout back>
        <Center mt='4'>
          <Spinner />
        </Center>
      </Layout>
    );
  }

  if (post === null) {
    return <NotFound />;
  }

  return (
    <Layout back>
      <Stack p='4'>
        <PostComponent
          post={post}
          onUpdate={handleUpdateWithState}
          onDelete={handleDeleteClick}
          onTagClick={(tag) => navigate(`/?q=${encodeURIComponent(tag)}`)}
        />
      </Stack>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Layout>
  );
};
