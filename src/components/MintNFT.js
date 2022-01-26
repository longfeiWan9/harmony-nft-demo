import React, {useState} from 'react';
import { NFTStorage } from "nft.storage";
import HarmonyFilecoinNFT from "../abi/HarmonyFilecoinNFT.json";
import ImagePreview from "../components/ImagePreview";
import { ethers } from 'ethers';
const APIKEY = '<your-nft-api-key>';
const nftContract = '<nft-contract-address>';

const MintNFT =() => {

    const [errorMessage, setErrorMessage] = useState(null);
    const [file, setFile] = useState();
    const [imageView, setImageView] = useState();
    const [metaDataURL, setMetaDataURl] = useState();
    const [txURL, setTxURL] = useState();
    const [txStatus, setTxStatus] = useState();

    const handleFileUpload = (event) => {
        console.log("file is uploaded");
        setFile(event.target.files[0]);
        setTxStatus("");
        setImageView("");
        setMetaDataURl("");
        setTxURL("");
    }
    const mintNFTToken = async(inputFile) =>{
        const metaData = await uploadFileToFilecoin(inputFile);
        setMetaDataURl(getIPFSGatewayURL(metaData.url));
        sendTxToHarmony(metaData);
    }

    const sendTxToHarmony = async(metadata) =>{
        try {
            setTxStatus("Sending mint transaction to Harmony Blockchain.");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const connectedContract = new ethers.Contract(
                nftContract,
                HarmonyFilecoinNFT.abi,
                provider.getSigner()
            );
            const mintNFTTx = await connectedContract.mintItem(metadata.url);
            console.log(mintNFTTx);
            let imgViewString = getIPFSGatewayURL(metadata.data.image.pathname);;
            setImageView(
                imgViewString
            );
            setMetaDataURl(getIPFSGatewayURL(metadata.url));
            setTxURL('https://explorer.pops.one/tx/'+ mintNFTTx.hash);
            setTxStatus("NFT is minted successfully!");
        } catch (error) {
            setErrorMessage("Failed to send tx to Harmony.");
            console.log(error);
        }

    }

    const uploadFileToFilecoin = async(inputFile) =>{
        const nftStorage = new NFTStorage({
            token: APIKEY,
          });
        try {
            setTxStatus("Uploading NFT to IPFS & Filecoin via NFT.storage.");
            const metadata = await nftStorage.store({
                name: 'Harmony NFT collection',
                description: 'This is a Harmony NFT collenction stored on IPFS & Filecoin.',
                image: file
            });
            return metadata;

        } catch (error) {
            setErrorMessage("Could not save NFT to NFT.Storage - Aborted minting.");
            console.log(error);
        }
    }


    const getIPFSGatewayURL = (ipfsURL)=>{
        let urlArray = ipfsURL.split("/");
        let ipfsGateWayURL = `https://${urlArray[2]}.ipfs.dweb.link/${urlArray[3]}`;
        return ipfsGateWayURL;
    }
    
    return(
        <div className='MintNFT'>
            <form>
                <h3>Mint your NFT on Harmony & Filecoin/IPFS</h3>
                <input type="file" onChange={handleFileUpload}></input>
                <button onClick={e=>{e.preventDefault();mintNFTToken(file)}}>Upload File</button>
            </form>
            {txStatus && <p>{txStatus}</p>}
            {imageView && <ImagePreview imgLink ={imageView}/>}
            {metaDataURL && <p><a href={metaDataURL}>Metadata on IPFS</a></p>}
            {txURL && <p><a href={txURL}>See the mint transaction</a></p>}
            {errorMessage}
        </div>
        
    );
}
export default MintNFT;