// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "https://github.com/bacalhau-project/lilypad-v0/blob/main/hardhat/contracts/LilypadEventsUpgradeable.sol";
import "https://github.com/bacalhau-project/lilypad-v0/blob/main/hardhat/contracts/LilypadCallerInterface.sol";
​
/**
    @notice An experimental contract for POC work to call Bacalhau jobs from FVM smart contracts
*/
contract KamuCallerV2 is LilypadCallerInterface, Ownable {
    address public bridgeAddress;
    LilypadEventsUpgradeable bridge;
    uint256 public lilypadFee; //=30000000000000000;
​
    struct KamuImage {
        string kamuManifest;
        string ipfsResult;
    }
​
    KamuImage[] public images;
    mapping (uint => string) prompts;
​
    event NewImageGenerated(KamuImage image);
​
    constructor(address _bridgeContractAddress) {
        console.log("Deploying Kamu contract");
        bridgeAddress = _bridgeContractAddress;
        bridge = LilypadEventsUpgradeable(_bridgeContractAddress);
        uint fee = bridge.getLilypadFee();
        lilypadFee = fee;
    }
​
    function setBridgeAddress(address _newAddress) public onlyOwner {
      bridgeAddress= _newAddress;
    }
​
    function setLPEventsAddress(address _eventsAddress) public onlyOwner {
        bridge = LilypadEventsUpgradeable(_eventsAddress);
    }
​
    function getLilypadFee() external {
        uint fee = bridge.getLilypadFee(); 
        console.log("fee", fee);
        lilypadFee = fee;
    }
​
    // not recommended
    function setLilypadFee(uint256 _fee) public onlyOwner {
        require(_fee > 0, "Lilypad fee must be greater than 0");
        lilypadFee = _fee;
    }
​
    string constant specStart = '{'
        '"Engine": "docker",'
        '"Verifier": "noop",'
        '"PublisherSpec": {"Type": "estuary"},'
        '"Docker": {'
        '"Image": "ghcr.io/kamu-data/kamu-base:latest-with-data",'
        '"Entrypoint": ["python", "main.py", "--o", "./outputs", "--p", "';
​
    string constant specEnd =
        '"]},'
        '"Resources": {"CPU": "1"},'
        '"Outputs": [{"Name": "outputs", "Path": "/outputs"}],'
        '"Deal": {"Concurrency": 1}'
        '}';
​
    
    
    function Kamu(string calldata _prompt) external payable {
        require(msg.value >= lilypadFee, "Not enough to run Lilypad job");
        // TODO: spec -> do proper json encoding, look out for quotes in _prompt
        string memory spec = string.concat(specStart, _prompt, specEnd);
        uint id = bridge.runLilypadJob{value: lilypadFee}(address(this), spec, uint8(LilypadResultType.CID));
        require(id > 0, "job didn't return a value");
        prompts[id] = _prompt;
    }
​
    function allImages() public view returns (KamuImage[] memory) {
        return images;
    }
​
    function lilypadFulfilled(address _from, uint _jobId, LilypadResultType _resultType, string calldata _result) external override {
        //need some checks here that it a legitimate result
        require(_from == address(bridge)); //really not secure
        require(_resultType == LilypadResultType.CID);
​
        KamuImage memory image = KamuImage({
            ipfsResult: _result,
            prompt: prompts[_jobId]
        });
        images.push(image);
        emit NewImageGenerated(image);
        delete prompts[_jobId];
    }
​
    function lilypadCancelled(address _from, uint _jobId, string calldata _errorMsg) external override {
        require(_from == address(bridge)); //really not secure
        console.log(_errorMsg);
        delete prompts[_jobId];
    }
}