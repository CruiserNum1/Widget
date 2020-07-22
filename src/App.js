import React from 'react';
import './App.css';
import Widget from './components/Widget/Widget';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './Redux/reducers';

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

function App() {
  return (
    <Provider store={store}>
      <Widget />
    </Provider>
  );
}

export default App;