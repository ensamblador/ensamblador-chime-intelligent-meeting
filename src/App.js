import React from 'react';
import './App.css';
import Meeting from './components/Meeting';


const BASE_URL = 'https://msrnkq2wj7.execute-api.us-east-1.amazonaws.com/Prod'

const endpoint = {
  join: BASE_URL + '/join'
}



function App() {
  return (
    <div className="App">
      <Meeting endpoint = {endpoint}/>
    </div>
  );
}

export default App;
