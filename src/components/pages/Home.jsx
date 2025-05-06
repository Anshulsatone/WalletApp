import React, { useState } from "react";
import { generateMnemonic } from "bip39";
import { SolanaWallet } from "../SolanaWallet/SolanaWallet";
import EthWallet from "../EthWallet/EthWallet";

const Home = () => {
  const [mnemonic, setMnemonic] = useState(""); 

  const handleGenerate = async () => {
    const newMnemonic = await generateMnemonic();
    setMnemonic(newMnemonic);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0F0F13] to-[#121218] text-white px-6 py-10 pt-20">
      {/* Increased padding-top to avoid content hiding behind navbar */}
      <h1 className="text-6xl font-bold text-center mt-25 mb-10">Web Wallet Generator</h1>

      {/* Mnemonic Section */}
      <div className="max-w-2xl mx-auto mb-10">
        <label className="block mb-2 text-m font-large">Mnemonic Phrase</label>
        <textarea
          rows={2}
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder="Generate or enter a mnemonic..."
          className="w-full p-7 rounded bg-gray-900 border border-gray-700 text-white resize-none"
        />
        <button
          onClick={handleGenerate}
          className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-300 transition"
        >
          🔄 Generate Mnemonic
        </button>
      </div>

      {/* Wallets Section */}
      {mnemonic && (
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-900 p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">SOLANA WALLET</h2>
            <SolanaWallet mnemonic={mnemonic} />
          </div>

          <div className="bg-gray-900 p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">ETHEREUM WALLET</h2>
            <EthWallet mnemonic={mnemonic} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
