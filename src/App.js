import nfc from './nfc.svg';
import './App.css';
import Scan from './containers/Scan';
import Write from './containers/Write';
import { useState } from 'react';
import { ActionsContext } from './contexts/context';
import attendezee from './logo_attendezz.png'

function App() {

  const [actions, setActions] = useState(null);
  const {scan, write} = actions || {};

  const actionsValue = {actions,setActions};

  const onHandleAction = (actions) =>{
    setActions({...actions});
  }

  return (
      <div className="App">
        <img src={attendezee} className="App-logo" alt="logo" />
        <h1>NFC Attendance</h1>
        <div className="App-container">
          <button id='check_in' onClick={()=>onHandleAction({scan: 'scanning', write: null,type:'Start_shift'})} className="btn">Check-In</button>
          <button id='check_out' onClick={()=>onHandleAction({scan: 'scanning', write: null,type:'End_shift'})} className="btn">Check-Out</button>
          <button onClick={()=>onHandleAction({scan: null, write: 'writing',type:'register'})} className="btn">Register</button>
        </div>
        <ActionsContext.Provider value={actionsValue}>
          {scan && <Scan/>}
          {write && <Write/>}
        </ActionsContext.Provider>
      </div>
  );
}

export default App;
