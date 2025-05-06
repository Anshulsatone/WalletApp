import React, { useState } from "react";
import Home from "./components/pages/Home";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { Buffer } from "buffer";
window.Buffer = Buffer;

const App = () => {
  const [mnemonic, setMnemonic] = useState("");

  return (
    <main>
      <Navbar />
      <Home mnemonic={mnemonic} setMnemonic={setMnemonic} />
      <Footer />
    </main>
  );
};

export default App;
