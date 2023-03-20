import { useState } from 'react';
import useGlobalListener from './networktables/useGlobalListener';
import ConnectionWarning from './components/ConnectionWarning.jsx';
import React, {useEffect} from 'react';
import './App.css';
import Grid from './components/Grid';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {

  const [tableEntries, setTableEntries] = useState({});
  useGlobalListener((key, value) => {
    setTableEntries(previousValue => ({
      ...previousValue,
      [key]: value,
    }));
  }, true);

  useEffect(() => {
    // define a custom handler function
    // for the contextmenu event
    const handleContextMenu = (e) => {
      // prevent the right-click menu from appearing
      e.preventDefault()
    }

    // attach the event listener to
    // the document object
    document.addEventListener("contextmenu", handleContextMenu)

    // clean up the event listener when
    // the component unmounts
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])


  return (
    <div className="App">
        <ConnectionWarning/>

        <Grid/>

    </div>
  );
}

export default App;
