import React, {useState, useEffect} from 'react';
import './App.css';
import Meeting from './components/Meeting';
import MicRecorder from './components/RecorderClass'


//const BASE_URL = 'https://msrnkq2wj7.execute-api.us-east-1.amazonaws.com/Prod/'
const CHIME_BACKEND = 'https://0qyyzzc6jd.execute-api.us-east-1.amazonaws.com/Prod/'

const endpoint = {
  join: CHIME_BACKEND + 'join',
  end: CHIME_BACKEND + 'end',
  logs: CHIME_BACKEND + 'logs'
}

//const recorder = new MicRecorder()


function App() {
  
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {

    const load = async () => {
     // await recorder.init()
      setLoaded(true)
    }
    if (loaded === false) {
      load()
    }
  }, [loaded])
  return (
    <div className="App">
      <Meeting endpoint={endpoint} />
    </div>
  );
}

export default App;
