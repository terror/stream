import { useSearchParams } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { Stream } from '../components/Stream';

export const Home = () => {
  const [searchParams] = useSearchParams();

  return (
    <Layout>
      <Stream query={decodeURIComponent(searchParams.get('q') || '')} />
    </Layout>
  );
};
