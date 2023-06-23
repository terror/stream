import { Route, Routes } from 'react-router-dom';

import { Home } from './pages/Home';
import { Post } from './pages/Post';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path='posts'>
        <Route path=':id' element={<Post />} />
      </Route>
    </Routes>
  );
};

export default App;
