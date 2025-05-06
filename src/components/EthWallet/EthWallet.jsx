import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";

const EthWallet = ({ mnemonic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState([]);

  const addWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const wallet = new Wallet(child.privateKey);

    const ethWallet = {
      address: wallet.address,
      privateKey: child.privateKey,
      showPrivate: false,
    };

    setWallets([...wallets, ethWallet]);
    setCurrentIndex(currentIndex + 1);
  };

  const togglePrivateKey = (index) => {
    const updated = [...wallets];
    updated[index].showPrivate = !updated[index].showPrivate;
    setWallets(updated);
  };

  return (
    <div className="space-y-6 font-['Inter'] text-white">
      <button
        onClick={addWallet}
        className="w-[180px] h-[44px] flex items-center gap-2 px-4 bg-[#1D1D26] text-white border border-[#26262F] rounded-[22px] hover:brightness-110 transition"
      >
        <span className="text-lg">➕</span> <span className="text-[15px] font-medium">Add Wallet</span>
      </button>

      {wallets.map((wallet, index) => (
        <div
          key={index}
          className="w-[380px] min-h-[330px] bg-[#17171F] border border-[#26262F] rounded-[16px] p-5 space-y-4 shadow-md"
        >
          {/* Ethereum Icon and Title */}
          <div className="flex items-center gap-3">
            <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-indigo-500" />
            <h3 className="text-[20px] font-semibold">Ethereum Wallet #{index + 1}</h3>
          </div>

          {/* Address Display */}
          <div className="w-[320px] h-[80px] bg-[#1A1A24] border border-[#26262F] rounded-[10px] p-3 space-y-1">
            <label className="text-[12px] text-[#7D7D9C] font-medium">Address</label>
            <p className="text-[12px] font-mono break-all">{wallet.address}</p>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => togglePrivateKey(index)}
            className="flex items-center gap-1 text-[12px] px-2 py-1 rounded-[4px] border border-[#3B4BF9] bg-[#1D1D26] hover:bg-[#2A2A3A] transition"
          >
            {wallet.showPrivate ? "Hide Private Key" : "Show Private Key"}
          </button>

          {/* Private Key */}
          {wallet.showPrivate && (
            <div className="text-red-400 text-[12px] font-mono break-all">
              Private Key: {wallet.privateKey}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EthWallet;
