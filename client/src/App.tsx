import { Route, Routes } from 'react-router-dom';

import { NotFound } from './components/NotFound';
import { Home } from './pages/Home';
import { Post } from './pages/Post';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path='posts'>
        <Route path=':id' element={<Post />} />
      </Route>
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default App;
