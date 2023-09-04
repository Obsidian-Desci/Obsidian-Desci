// SPDX-License-Identifier: GPLv3
pragma solidity 0.8.19;

interface ModicumContract {
  function runModuleWithDefaultMediators(string calldata name, string calldata params) external payable returns (uint256);
}

// Payment is 2 lilETH for all jobs currently
// got to testnet.lilypadnetwork.org to fund your wallet
contract ExampleClient {
  address public _contractAddress;
  ModicumContract remoteContractInstance;

  uint256 public lilypadFee = 2;

  struct Result {
      uint256 jobID;
      string cid;
      string httpString;
  }

  Result[] public results;

  event ReceivedJobResults(uint256 jobID, string cid);

  // The Modicum contract address is found here: https://github.com/bacalhau-project/lilypad-modicum/blob/main/latest.txt
  // Current: 0x422F325AA109A3038BDCb7B03Dd0331A4aC2cD1a
  constructor (address contractAddress) {
    require(contractAddress != address(0), "NaiveExamplesClient: contract cannot be zero address");
    _contractAddress = contractAddress;
    remoteContractInstance = ModicumContract(contractAddress);
  }

  function setLilypadFee(uint256 _fee) public {
      lilypadFee = _fee;
  }
  
  function runCowsay(string memory sayWhat) public payable returns (uint256) {
    require(msg.value == lilypadFee * 1 ether, string(abi.encodePacked("Payment of 2 Ether is required")));
    return runModule("cowsay:v0.0.1", sayWhat);
  }

  function runStablediffusion(string memory prompt) public payable returns (uint256) {
    require(msg.value == lilypadFee * 1 ether, string(abi.encodePacked("Payment of 2 Ether is required")));
    return runModule("stable_diffusion:v0.0.1", prompt);
  }

  function runSDXL(string memory prompt) public payable returns (uint256) {
    require(msg.value == lilypadFee * 1 ether, string(abi.encodePacked("Payment of 2 Ether is required")));
    return runModule("sdxl:v0.9-lilypad1", prompt);
  }

 function runModule(string memory name, string memory params) public payable returns (uint256) {
    require(msg.value == lilypadFee * 1 ether, string(abi.encodePacked("Payment of 2 Ether is required")));
    return remoteContractInstance.runModuleWithDefaultMediators{value: msg.value}(name, params);
  }

  // Implemented Modicum interface. This saves results to a results array
  function receiveJobResults(uint256 _jobID, string calldata _cid) public {
    Result memory jobResult = Result({
        jobID: _jobID,
        cid: _cid,
        httpString: string(abi.encodePacked("https://ipfs.io/ipfs/", _cid))
    });
    results.push(jobResult);

    emit ReceivedJobResults(_jobID, _cid);
  }

  function fetchAllResults() public view returns (Result[] memory) {
    return results;
  }
}