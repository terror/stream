import { Fragment } from 'react';

import { Navbar } from './components/Navbar';
import { Stream } from './components/Stream';

const App = () => {
  return (
    <Fragment>
      <Navbar />
      <Stream />
    </Fragment>
  );
};

export default App;
