import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import './App.css';
import FontGroup from './components/FontGroup';
import FileUpload from './components/FontUpload';

function App() {
  const [fonts, setFonts] = useState([]);

  const getUpdatedFontList = (newValue) => {
    setFonts(newValue)
  }

  return (
    <div className="App">
        <FileUpload getUpdatedFontList={getUpdatedFontList}/>
        <FontGroup fonts={fonts}/>
    </div>
  );
}

export default App;
