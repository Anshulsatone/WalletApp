import React, { useState, useEffect } from "react";
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

// Icons
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRight, 
  Shield, 
  Lock
} from "lucide-react";

// Main WalletGenerator component
const WalletGenerator = () => {
  // Step tracking state
  const [currentStep, setCurrentStep] = useState(1);
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicArray, setMnemonicArray] = useState([]);
  const [ethWallets, setEthWallets] = useState([]);
  const [solWallets, setSolWallets] = useState([]);
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [verificationWords, setVerificationWords] = useState([]);
  const [verificationInputs, setVerificationInputs] = useState({});
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);

  // Generate mnemonic and split into array for display
  const handleGenerateMnemonic = () => {
    const newMnemonic = generateMnemonic(256); // 24 words
    setMnemonic(newMnemonic);
    setMnemonicArray(newMnemonic.split(" "));
    setCurrentStep(2);
  };

  // Copy mnemonic to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  // Download mnemonic as a text file
  const downloadMnemonic = () => {
    const element = document.createElement("a");
    const file = new Blob([mnemonic], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "wallet-recovery-phrase.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Setup verification words when moving to verification step
  const setupVerification = () => {
    const words = mnemonicArray;
    const indices = [];
    
    // Select 3 random word positions for verification
    while (indices.length < 3) {
      const index = Math.floor(Math.random() * words.length);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    
    // Sort indices to present them in order
    indices.sort((a, b) => a - b);
    setVerificationWords(indices);
    setCurrentStep(3);
  };

  // Handle verification input changes
  const handleVerificationInput = (index, value) => {
    setVerificationInputs({
      ...verificationInputs,
      [index]: value
    });
  };

  // Verify user inputs match the original mnemonic
  const verifyMnemonic = () => {
    const isCorrect = verificationWords.every(
      index => verificationInputs[index]?.toLowerCase().trim() === mnemonicArray[index].toLowerCase()
    );
    
    if (isCorrect) {
      setVerificationSuccess(true);
      setTimeout(() => {
        generateWallets();
        setCurrentStep(4);
      }, 1000);
    } else {
      setVerificationFailed(true);
      setTimeout(() => setVerificationFailed(false), 2000);
    }
  };

  // Generate both ETH and SOL wallets from the mnemonic
  const generateWallets = async () => {
    // Generate ETH wallet
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const derivationPath = `m/44'/60'/0'/0/0`;
      const hdNode = HDNodeWallet.fromSeed(seed);
      const child = hdNode.derivePath(derivationPath);
      const privateKey = child.privateKey;
      const wallet = new Wallet(privateKey);

      setEthWallets([{
        address: wallet.address,
        privateKey: privateKey
      }]);
    } catch (error) {
      console.error("Error generating ETH wallet:", error);
    }

    // Generate Solana wallet
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const path = `m/44'/501'/0'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secretKey = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secretKey);

      setSolWallets([{
        publicKey: keypair.publicKey.toBase58(),
        privateKey: Buffer.from(secretKey).toString('hex')
      }]);
    } catch (error) {
      console.error("Error generating Solana wallet:", error);
    }
  };

  // Toggle visibility of private keys
  const togglePrivateKeyVisibility = () => {
    setIsPrivateKeyVisible(!isPrivateKeyVisible);
  };

  // Copy address to clipboard
  const copyAddress = (address, type) => {
    navigator.clipboard.writeText(address);
    setCopySuccess(`${type} address copied!`);
    setTimeout(() => setCopySuccess(""), 2000);
  };

  // Render different steps of the wallet generation process
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-gray-900 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Shield className="h-16 w-16 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Secure Your New Wallet</h1>
              <p className="text-gray-300 mb-4">
                You're about to generate your wallet's seed phrase - the master key to your digital assets.
              </p>
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-start">
                  <AlertTriangle className="text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 font-medium mb-1">Important Security Warning</p>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• Your seed phrase is the <strong>only way</strong> to recover your wallet if you lose access</li>
                      <li>• Write it down and store it in a secure physical location</li>
                      <li>• Never share your seed phrase with anyone</li>
                      <li>• Any person with your seed phrase can access all your funds</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleGenerateMnemonic}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center transition-colors"
            >
              <Lock className="mr-2 h-5 w-5" />
              Generate Seed Phrase
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        );
        
      case 2:
        return (
          <div className="bg-gray-900 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-3">Your Recovery Seed Phrase</h1>
              <p className="text-gray-300 mb-4">
                Carefully write down these 24 words in exact order and store them securely.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {mnemonicArray.map((word, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2 w-5 text-right">{index + 1}.</span>
                    <span className="bg-gray-700 py-1 px-3 rounded font-mono text-white">{word}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 mb-6">
              <button 
                onClick={copyToClipboard}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copySuccess || "Copy to Clipboard"}
              </button>
              
              <button 
                onClick={downloadMnemonic}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
              >
                <Download className="mr-2 h-4 w-4" />
                Download as Text File
              </button>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                <strong>Security reminder:</strong> Your digital copy is only temporary. For long-term security, write down your seed phrase on paper and store it safely.
              </p>
            </div>
            
            <button 
              onClick={setupVerification}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors"
            >
              Verify Seed Phrase
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        );
        
      case 3:
        return (
          <div className="bg-gray-900 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-3">Verify Your Seed Phrase</h1>
              <p className="text-gray-300 mb-4">
                Enter the requested words from your seed phrase to verify you've saved them correctly.
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              {verificationWords.map((wordIndex) => (
                <div key={wordIndex} className="flex items-center">
                  <label className="block w-full">
                    <span className="text-gray-300 mb-1 block">Word #{wordIndex + 1}:</span>
                    <input
                      type="text"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => handleVerificationInput(wordIndex, e.target.value)}
                      placeholder={`Enter word #${wordIndex + 1}`}
                    />
                  </label>
                </div>
              ))}
            </div>
            
            {verificationFailed && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6 text-red-200">
                <p className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                  Verification failed. Please check your words and try again.
                </p>
              </div>
            )}
            
            {verificationSuccess && (
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-6 text-green-200">
                <p className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                  Verification successful! Generating your wallets...
                </p>
              </div>
            )}
            
            <button 
              onClick={verifyMnemonic}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors"
            >
              Verify & Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        );
        
      case 4:
        return (
          <div className="bg-gray-900 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Your Wallet is Ready!</h1>
              <p className="text-gray-300 mb-6">
                Your wallets have been successfully created from your seed phrase.
              </p>
            </div>
            
            {/* ETH Wallet Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                  <span className="text-xl">Ξ</span>
                </div>
                <h2 className="text-xl font-semibold">Ethereum Wallet</h2>
              </div>
              
              {ethWallets.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Public Address:</p>
                    <div className="flex items-center">
                      <div className="bg-gray-700 py-2 px-3 rounded font-mono text-white text-sm overflow-x-auto flex-1 whitespace-nowrap">
                        {ethWallets[0].address}
                      </div>
                      <button 
                        onClick={() => copyAddress(ethWallets[0].address, "ETH")}
                        className="ml-2 p-2 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-400">Private Key:</p>
                      <button 
                        onClick={togglePrivateKeyVisibility}
                        className="text-sm flex items-center text-gray-400 hover:text-white"
                      >
                        {isPrivateKeyVisible ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" /> Show
                          </>
                        )}
                      </button>
                    </div>
                    {isPrivateKeyVisible ? (
                      <div className="bg-gray-700 py-2 px-3 rounded font-mono text-white text-sm overflow-x-auto whitespace-nowrap">
                        {ethWallets[0].privateKey}
                      </div>
                    ) : (
                      <div className="bg-gray-700 py-2 px-3 rounded text-gray-500 text-sm">
                        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Solana Wallet Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center mr-3">
                  <span className="text-xl">◎</span>
                </div>
                <h2 className="text-xl font-semibold">Solana Wallet</h2>
              </div>
              
              {solWallets.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Public Address:</p>
                    <div className="flex items-center">
                      <div className="bg-gray-700 py-2 px-3 rounded font-mono text-white text-sm overflow-x-auto flex-1 whitespace-nowrap">
                        {solWallets[0].publicKey}
                      </div>
                      <button 
                        onClick={() => copyAddress(solWallets[0].publicKey, "SOL")}
                        className="ml-2 p-2 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-400">Private Key:</p>
                      <button 
                        onClick={togglePrivateKeyVisibility}
                        className="text-sm flex items-center text-gray-400 hover:text-white"
                      >
                        {isPrivateKeyVisible ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" /> Show
                          </>
                        )}
                      </button>
                    </div>
                    {isPrivateKeyVisible ? (
                      <div className="bg-gray-700 py-2 px-3 rounded font-mono text-white text-sm overflow-x-auto whitespace-nowrap">
                        {solWallets[0].privateKey}
                      </div>
                    ) : (
                      <div className="bg-gray-700 py-2 px-3 rounded text-gray-500 text-sm">
                        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {copySuccess && (
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 mb-6 text-green-200 text-center">
                <p className="flex items-center justify-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                  {copySuccess}
                </p>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => setCurrentStep(1)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Create New Wallet
              </button>
              
              <button 
                className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Access My Wallet
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      {/* Progress Indicator */}
      {currentStep > 1 && (
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`flex flex-col items-center ${currentStep >= step ? "text-blue-400" : "text-gray-600"}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    currentStep > step 
                      ? "bg-blue-600 text-white" 
                      : currentStep === step 
                        ? "bg-blue-900 border-2 border-blue-500 text-white" 
                        : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                <span className="text-xs">
                  {step === 1 ? "Start" : 
                   step === 2 ? "Generate" : 
                   step === 3 ? "Verify" : "Complete"}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-gray-800 mt-4">
            <div 
              className="absolute h-1 bg-blue-600 transition-all duration-500" 
              style={{ width: `${(currentStep - 1) * 33.3}%` }}
            />
          </div>
        </div>
      )}
      
      {renderStep()}
    </div>
  );
};

export default WalletGenerator;