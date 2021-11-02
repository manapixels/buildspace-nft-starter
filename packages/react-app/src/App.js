import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import abi from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = '0x384986ae05efFD941aeE82A6d2FCDb4180418F6C'
const OPENSEA_LINK = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/`;
const contractABI = abi.abi;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("")
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalNFTsMintedSoFar, setTotalNFTsMintedSoFar] = useState(0)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      /*
      * First make sure we have access to window.ethereum
      */
      const { ethereum } = window;
  
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      /*
      * User can have multiple authorized accounts, we grab the first one if its there!
      */
      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)
          setupEventListener()
          
      } else {
          console.log("No authorized account found")
      }
    }
    checkIfWalletIsConnected();
  }, [])

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        let _maxSupply = await connectedContract.getMaxSupply()
        setMaxSupply(_maxSupply.toNumber())

        let _totalNFTsMintedSoFar = await connectedContract.getTotalNFTsMintedSoFar()
        setTotalNFTsMintedSoFar(_totalNFTsMintedSoFar.toNumber())

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {

      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

          setIsFetching(true)
  
          console.log("Going to pop wallet now to pay gas...")
          let nftTxn = await connectedContract.makeAnEpicNFT();
  
          console.log("Mining...please wait.")
          await nftTxn.wait();
          
          console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
          setIsFetching(false)

          let _totalNFTsMintedSoFar = await connectedContract.getTotalNFTsMintedSoFar()
          setTotalNFTsMintedSoFar(_totalNFTsMintedSoFar.toNumber())
  
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
        setIsFetching(false)
      }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount && <div className="white-text">Connected wallet: {currentAccount}</div>}

          {currentAccount === "" ? (
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
              Connect to Wallet
            </button>
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button" disabled={isFetching}>
              {isFetching ? 'Minting...' : 'Mint NFT'}
            </button>
          )}
        </div>

        <div className="white-text">{totalNFTsMintedSoFar} of {maxSupply} NFTs minted</div>

        <div className="footer-container">
          <a href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}}`} className="cta-button connect-wallet-button">
            <span role="img" aria-label="Wave">🌊</span> View Collection on OpenSea
          </a>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
