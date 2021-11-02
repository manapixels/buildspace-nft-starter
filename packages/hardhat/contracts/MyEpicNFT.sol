// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// We first import some OpenZeppelin Contracts.
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import {Base64} from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint maxSupply = 50;

    string baseSvg =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = [
        "Adorable",
        "Adventurous",
        "Aggressive",
        "Agreeable",
        "Alert",
        "Alive"
    ];
    string[] secondWords = [
        "Apple",
        "Orange",
        "Strawberry",
        "Banana",
        "Kiwi",
        "Honeydew"
    ];
    string[] thirdWords = [
        "Patamon",
        "Terriermon",
        "Agumon",
        "Veemon",
        "Palmon",
        "Biyomon"
    ];

    event NewEpicNFTMinted(address sender, uint256 tokenId);

    // We need to pass the name of our NFTs token and it's symbol.
    constructor() ERC721("Digimon", "DIGI") {
        console.log("This is a Digimon NFT contract");
    }

    function getMaxSupply() public view returns (uint) {
        return maxSupply;
    }

    function getTotalNFTsMintedSoFar() public view returns (uint) {
        return _tokenIds.current() + 1;
    }

    // I create a function to randomly pick a word from each array.
    function pickRandomFirstWord(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        // I seed the random generator. More on this in the lesson.
        uint256 rand = random(
            string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId)))
        );
        // Squash the # between 0 and the length of the array to avoid going out of bounds.
        rand = rand % firstWords.length;
        return firstWords[rand];
    }

    function pickRandomSecondWord(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId)))
        );
        rand = rand % secondWords.length;
        return secondWords[rand];
    }

    function pickRandomThirdWord(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId)))
        );
        rand = rand % thirdWords.length;
        return thirdWords[rand];
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function makeAnEpicNFT() public {
        // Get the current tokenId, this starts at 0.
        uint256 newItemId = _tokenIds.current();

        require(newItemId < maxSupply, "All NFTs minted");

        string memory first = pickRandomFirstWord(newItemId);
        string memory second = pickRandomSecondWord(newItemId);
        string memory third = pickRandomThirdWord(newItemId);
        string memory combinedWord = string(
            abi.encodePacked(first, second, third)
        );

        string memory finalSvg = string(
            abi.encodePacked(baseSvg, combinedWord, "</text></svg>")
        );

        // Get all the JSON metadata in place and base64 encode it.
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        // We set the title of our NFT as the generated word.
                        combinedWord,
                        '", "description": "A collection of Digimon squares.", "image": "data:image/svg+xml;base64,',
                        // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("\n--------------------");
        console.log(finalTokenUri);
        console.log("--------------------\n");

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, finalTokenUri);
        console.log(
            "An NFT w/ ID %s has been minted to %s",
            newItemId,
            msg.sender
        );

        emit NewEpicNFTMinted(msg.sender, newItemId);

        _tokenIds.increment();
    }
}
