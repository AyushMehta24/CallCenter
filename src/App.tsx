import { Route, Routes } from 'react-router-dom';
import Layout from "layout/Layout";
import VoiceCall from 'components/DialPad/VoiceCall';
import HomePage from 'pages/home/HomePage';

function App() {
  return <>
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/phone" element={<VoiceCall/>}/>
      <Route path="*" element={<Layout />} />
    </Routes>
  </>;
}

export default App;
