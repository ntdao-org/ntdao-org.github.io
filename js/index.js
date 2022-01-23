const setTheme = (theme) => (document.documentElement.className = theme);
setTheme("aquamarine"); // initialize
countDownTimer("countdown", "2022-01-06T13:00:00.000Z");
let nftContract;

let chainId = 8217;
const networkList = {
  8217: "Klaytn Mainnet",
  1001: "Klaytn Testnet",
};
let myAddr;
let mintingFee;
let totalsupplyInterval;

let openMyCardsView = false;
let mintingState = 0;
let multiCount = 0;
let isKaikas = false;

let checkInTokenIdList = [];

const openseaurl = {
  8217: "https://opensea.io/assets/0x122DbB0C76d1d96a9187a50C898A789b0Ed1cf7C/",
  1001: "https://testnets.opensea.io/assets/baobab/0xDBBabb59cBB6101EFFa83cBc11E3A760eCF32dA6/",
};

const nftAddress = {
  8217: "0x122DbB0C76d1d96a9187a50C898A789b0Ed1cf7C",
  1001: "0xDBBabb59cBB6101EFFa83cBc11E3A760eCF32dA6",
};

const nftAbi = {
  8217: ntdabi_klaytn_mainnet,
  1001: ntdabi_klaytn_testnet,
};

showBanner();

window.addEventListener("load", function () {
  //getTotalSupplyNoWallet();
  getTotalSupplyNoWalletEJ();
  loadWeb3();
  if (typeof window.web3 !== "undefined") {
    watchChainAccount();
    startApp();
  } else {
    alert("You need to install dapp browser first to use this site!");
  }
});

function loadWeb3() {
  if (typeof window.caver !== "undefined") {
    window.web3 = new Web3(window.caver);
    isKaikas = true;
  } else {
    window.web3 = new Web3(window.ethereum);
    isKaikas = false;
    // window.web3 = new Web3(
    //   "https://mainnet.infura.io/v3/302b2ccfd49a40d480567a132cb7eb1d"
    // );
  }
}

function watchChainAccount() {
  web3.currentProvider.on("accountsChanged", (accounts) => {
    startApp();
  });
  web3.currentProvider.on("chainChanged", (chainId) => {
    window.location.reload();
    // startApp();
  });
}

async function startApp() {
  console.log("startApp");
  try {
    var currentChainId = await web3.eth.getChainId();
    chainId = currentChainId;

    if (chainId == 8217 || chainId == 1001) {
      await getAccount();
    } else {
      $(".my-address").html("지갑이 Klaytn 네트웍에 연결되어있지 않습니다.");
    }
  } catch (err) {
    console.log("startApp => ", err);
  }
}

async function getAccount() {
  try {
    await getContracts();

    // console.log("getAccount accounts  => ", accounts);
    if (isKaikas) {
      let account = window.klaytn.selectedAddress;
      if (account != null) {
        myAddr = account;

        $("#div-myaddress").show();
        $(".my-address").html(getLink(myAddr, chainId));
        $("#content_body").show();
        $("#connect-btn").hide();
        $("#my-addr-btn").show();
        await getTotalSupply();
      } else {
        console.log("No Klaytn account is available!");
        $("#div-myaddress").hide();
        $("#content_body").hide();
        $("#connect-btn").show();
        $("#my-addr-btn").hide();

        $(".description").html(
          "<p>모금에 참여하려면 지갑 연결 버튼을 클릭하여 지갑을 연결하세요..</p>"
        );
      }
    } else {
      var accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        // myAddr = web3.utils.toChecksumAddress(accounts[0]);
        myAddr = accounts[0];

        $("#div-myaddress").show();
        $(".my-address").html(getLink(myAddr, chainId));
        $("#content_body").show();
        $("#connect-btn").hide();
        $("#my-addr-btn").show();
        await getTotalSupply();
      } else {
        console.log("No Klaytn account is available!");
        $("#div-myaddress").hide();
        $("#content_body").hide();
        $("#connect-btn").show();
        $("#my-addr-btn").hide();

        $(".description").html(
          "<p>모금에 참여하려면 지갑 연결 버튼을 클릭하여 지갑을 연결하세요..</p>"
        );
      }
    }
    console.log("myAddr=>", myAddr);
    $(".nft-address").html(getLink(nftAddress[chainId], chainId));
    $(".opensea-address").html(getMyOpenSeaLink(chainId, myAddr));
  } catch (err) {
    console.log("getAccount => ", err);
    $("#div-myaddress").hide();
    $("#content_body").hide();
    $("#connect-btn").show();
    $("#my-addr-btn").hide();
    $(".description").html(
      "<p>모금에 참여하려면 지갑 연결 버튼을 클릭하여 지갑을 연결하세요..</p>"
    );
    $(".my-address").html("지갑에서 Klaytn 네트웍을 선택하세요");
  }
}

function connectWallet() {
  if (isKaikas) {
    window.klaytn
      .enable()
      .then((accounts) => {
        // console.log("accounts => ", accounts);
        myAddr = accounts[0];
        $(".my-address").html(getLink(myAddr, chainId));
        startApp();
      })
      .catch((err) => {
        //   isMintingAvailable(false);
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log("Please connect to Your wallet!");
        } else {
          console.error(err);
        }
      });
  } else {
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        myAddr = accounts[0];
        $(".my-address").html(getLink(myAddr, chainId));
        startApp();
      })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log("Please connect to Your wallet!");
        } else {
          console.error(err);
        }
      });
  }
}

async function getContracts() {
  if (isKaikas) {
    nftContract = new caver.klay.Contract(nftAbi[chainId], nftAddress[chainId]);
  } else {
    nftContract = new web3.eth.Contract(nftAbi[chainId], nftAddress[chainId]);
  }
  await getMintingState();
}

async function getMintingState() {
  /*
  state
  0 : Setup,
  1 : PublicMint, 
  2 : Refund,
  3 : Finished
  */
  btn_mint = document.getElementById("btn_mint");
  mintingState = await nftContract.methods.getMintingState().call();
  // console.log("mintingState =>", mintingState);
  switch (mintingState.toString()) {
    case "0":
      btn_mint.disabled = true;
      btn_mint.innerText = "민팅 23일 오후 9시 시작됩니다.";
      break;
    case "1":
      btn_mint.disabled = false;
      btn_mint.innerText = "민팅 참여하기";
      break;
    case "2":
      btn_mint.disabled = false;
      btn_mint.innerText = "NFT 환불";
      my_refundable_cnt = document.getElementById("my_refundable_cnt");
      my_refundable_cnt.innerText = "환불 가능한 내 NFT 개수";
      $("#my_fund_klay").hide();

      break;
    case "3":
      btn_mint.disabled = false;
      btn_mint.innerText = "민팅 종료!! 내 NFT 보기";
      break;
  }

  await getMultiClaimCount();
}

async function getMultiClaimCount() {
  let claimcount = document.getElementById("claimcount");
  let optionItem = "";
  // getMinting Fee
  const fee_wei = await nftContract.methods.MINTING_FEE().call();
  const fee_gwei = ethers.utils.formatUnits(fee_wei, 18);

  switch (mintingState.toString()) {
    // pre-mint
    case "1":
      multiCount = await nftContract.methods.MAX_PUBLIC_MULTI().call();
      for (let i = 1; i < parseInt(multiCount) + 1; i++) {
        if (i === 1) {
          optionItem =
            optionItem +
            '<option value="' +
            i +
            '" selected="selected">' +
            i +
            "</option>";
        } else {
          optionItem =
            optionItem + '<option value="' + i + '" >' + i + "</option>";
        }
      }
      claimcount.innerHTML = optionItem;
      $("#claimcount").show();
      break;
    case "2":
      multiCount = await nftContract.methods.MAX_PUBLIC_MULTI().call();
      $("#claimcount").hide();
      break;
    default:
      multiCount = 0;
      break;
  }
}

async function getTotalSupply() {
  // clearInterval(totalsupplyInterval);

  let maxCnt = 0;
  let mintedCnt = 0;
  // if (chainId == 8217) {
  mintedCnt = await nftContract.methods.totalSupply().call();
  maxCnt = await checkMintingState(mintedCnt);

  // console.log("getTotalSupply   maxCnt=> ", maxCnt);
  // console.log("getTotalSupply   mintedCnt=> ", mintedCnt);

  let target_fund_cnt = document.getElementById("target_fund_cnt");
  let current_fund_cnt = document.getElementById("current_fund_cnt");

  let target_fund_klay = document.getElementById("target_fund_klay");
  let current_fund_klay = document.getElementById("current_fund_klay");

  const fee_wei = await nftContract.methods.MINTING_FEE().call();

  const fee_gwei = ethers.utils.formatEther(fee_wei);
  const target_fund_klay_wei = ethers.BigNumber.from(fee_wei).mul(maxCnt);
  const current_fund_klay_wei = ethers.BigNumber.from(fee_wei).mul(mintedCnt);

  let target_fund_klay_gwei = ethers.utils.formatEther(target_fund_klay_wei);
  target_fund_klay_gwei = gencurrencyFormat(target_fund_klay_gwei);

  let current_fund_klay_gwei = ethers.utils.formatEther(current_fund_klay_wei);
  current_fund_klay_gwei = gencurrencyFormat(current_fund_klay_gwei);

  maxCnt = gencurrencyFormat(maxCnt);
  mintedCnt = gencurrencyFormat(mintedCnt);

  target_fund_cnt.innerText = maxCnt;
  current_fund_cnt.innerText = mintedCnt;
  target_fund_klay.innerHTML =
    target_fund_klay_gwei + '<span style="font-size: 14px"> KLAY</span>';
  current_fund_klay.innerHTML =
    current_fund_klay_gwei + '<span style="font-size: 14px"> KLAY</span>';

  $(".claimedcnt").html(mintedCnt + "/" + maxCnt);
  $(".mintinnfee").html("[ " + fee_gwei + " KLAY ]");

  const mycards = await getMyCards();
  setMyCardCnt(mycards);
  // showCardList("minted_cards_deck", null);
  // }
}

async function getTotalSupplyNoWallet() {
  // clearInterval(totalsupplyInterval);
  let cweb3 = new Web3( new Web3.providers.HttpProvider("https://public-node-api.klaytnapi.com/v1/cypress"));
  let cnftContract = new cweb3.eth.Contract(nftAbi[chainId], nftAddress[chainId]);

  let maxCnt = 0;
  let mintedCnt = 0;
  // if (chainId == 8217) {
  mintedCnt = await cnftContract.methods.totalSupply().call();
  maxCnt = await cnftContract.methods.MAX_PUBLIC_ID().call();

   //console.log("getTotalSupply   maxCnt=> ", maxCnt);
   //console.log("getTotalSupply   mintedCnt=> ", mintedCnt);

  let target_fund_cnt = document.getElementById("target_fund_cnt");
  let current_fund_cnt = document.getElementById("current_fund_cnt");

  let target_fund_klay = document.getElementById("target_fund_klay");
  let current_fund_klay = document.getElementById("current_fund_klay");

  const fee_wei = await cnftContract.methods.MINTING_FEE().call();

  const fee_gwei = ethers.utils.formatEther(fee_wei);
  const target_fund_klay_wei = ethers.BigNumber.from(fee_wei).mul(maxCnt);
  const current_fund_klay_wei = ethers.BigNumber.from(fee_wei).mul(mintedCnt);

  let target_fund_klay_gwei = ethers.utils.formatEther(target_fund_klay_wei);
  target_fund_klay_gwei = gencurrencyFormat(target_fund_klay_gwei);

  let current_fund_klay_gwei = ethers.utils.formatEther(current_fund_klay_wei);
  current_fund_klay_gwei = gencurrencyFormat(current_fund_klay_gwei);

  maxCnt = gencurrencyFormat(maxCnt);
  mintedCnt = gencurrencyFormat(mintedCnt);

  target_fund_cnt.innerText = maxCnt;
  current_fund_cnt.innerText = mintedCnt;
  target_fund_klay.innerHTML =
    target_fund_klay_gwei + '<span style="font-size: 14px"> KLAY</span>';
  current_fund_klay.innerHTML =
    current_fund_klay_gwei + '<span style="font-size: 14px"> KLAY</span>';

  $(".claimedcnt").html(mintedCnt + "/" + maxCnt);
  $(".mintinnfee").html("[ " + fee_gwei + " KLAY ]");

  //const mycards = await getMyCards();
  //setMyCardCnt(mycards);
  // showCardList("minted_cards_deck", null);
  // }
}


async function getTotalSupplyNoWalletEJ() {
  // clearInterval(totalsupplyInterval);
  //let cweb3 = new Web3( new Web3.providers.HttpProvider("https://public-node-api.klaytnapi.com/v1/cypress"));
  //let cnftContract = new cweb3.eth.Contract(nftAbi[chainId], nftAddress[chainId]);

  let provider = new ethers.providers.JsonRpcProvider('https://public-node-api.klaytnapi.com/v1/cypress')
  let cnftContract = new ethers.Contract(nftAddress[chainId], nftAbi[chainId], provider);

  let maxCnt = 0;
  let mintedCnt = 0;
  // if (chainId == 8217) {
  mintedCnt = await cnftContract.totalSupply();
  maxCnt = await cnftContract.MAX_PUBLIC_ID();

   //console.log("getTotalSupply   maxCnt=> ", maxCnt);
   //console.log("getTotalSupply   mintedCnt=> ", mintedCnt);

  let target_fund_cnt = document.getElementById("target_fund_cnt");
  let current_fund_cnt = document.getElementById("current_fund_cnt");

  let target_fund_klay = document.getElementById("target_fund_klay");
  let current_fund_klay = document.getElementById("current_fund_klay");

  const fee_wei = await cnftContract.MINTING_FEE();

  const fee_gwei = ethers.utils.formatEther(fee_wei);
  const target_fund_klay_wei = ethers.BigNumber.from(fee_wei).mul(maxCnt);
  const current_fund_klay_wei = ethers.BigNumber.from(fee_wei).mul(mintedCnt);

  let target_fund_klay_gwei = ethers.utils.formatEther(target_fund_klay_wei);
  target_fund_klay_gwei = gencurrencyFormat(target_fund_klay_gwei);

  let current_fund_klay_gwei = ethers.utils.formatEther(current_fund_klay_wei);
  current_fund_klay_gwei = gencurrencyFormat(current_fund_klay_gwei);

  maxCnt = gencurrencyFormat(maxCnt);
  mintedCnt = gencurrencyFormat(mintedCnt);

  target_fund_cnt.innerText = maxCnt;
  current_fund_cnt.innerText = mintedCnt;
  target_fund_klay.innerHTML =
    target_fund_klay_gwei + '<span style="font-size: 14px"> KLAY</span>';
  current_fund_klay.innerHTML =
    current_fund_klay_gwei + '<span style="font-size: 14px"> KLAY</span>';

  $(".claimedcnt").html(mintedCnt + "/" + maxCnt);
  $(".mintinnfee").html("[ " + fee_gwei + " KLAY ]");

  //const mycards = await getMyCards();
  //setMyCardCnt(mycards);
  // showCardList("minted_cards_deck", null);
  // }
}

async function checkMintingState(_mintedCnt) {
  /*
  state
  0 : Setup,
  1 : PublicMint, 
  2 : Refund,
  3 : Finished
  */

  let maxCnt = 0;
  btn_mint = document.getElementById("btn_mint");
  maxCnt = await nftContract.methods.MAX_PUBLIC_ID().call();
  switch (mintingState.toString()) {
    case "0":
      break;
    case "1":
      // public mint
      if (parseInt(_mintedCnt) == parseInt(maxCnt)) {
        btn_mint.disabled = true;
      } else {
        btn_mint.disabled = false;
      }
      btn_mint.disabled = false;
      $("#terms-agree-div").show();

      break;
    case "2":
      // refund
      btn_mint.disabled = false;
      $("#terms-agree-div").hide();
      break;
  }
  return maxCnt;
}

async function nftMint() {
  if (mintingState == 2) {
    nftRefund();
    return;
  }
  try {
    $("#minting-loading").show();

    // console.log("mintingState -> ", mintingState);
    // getMinting Fee
    const fee_wei = await nftContract.methods.MINTING_FEE().call();
    const mintingCount = $("#claimcount option:selected").val();

    const wei_value = ethers.BigNumber.from(fee_wei).mul(mintingCount);
    const total_mintingfee = ethers.utils.formatEther(wei_value);

    // console.log("total_mintingfee =>", total_mintingfee);

    switch (mintingState.toString()) {
      case "1":
        // public minting
        console.log("public Minting");

        if (isKaikas) {
          let estmated_gas;
          await nftContract.methods
            .publicMint(mintingCount)
            .estimateGas({
              from: myAddr,
              value: ethers.utils.parseEther(total_mintingfee.toString()),
            })
            .then(function (gasAmount) {
              estmated_gas = gasAmount;
              console.log("Gas => ", gasAmount);
            })
            .catch(function (error) {
              console.log("Gas error => ", error);
            });

          nftContract.methods
            .publicMint(mintingCount)
            .send({
              from: myAddr,
              gas: estmated_gas,
              value: ethers.utils.parseEther(total_mintingfee.toString()),
            })
            .on("transactionHash", (txid) => {
              // console.log(`txid: ${txid}`)
            })
            .once("allEvents", (allEvents) => {
              // console.log('allEvents')
              // console.log(transferEvent)
            })
            .once("Transfer", (transferEvent) => {
              // console.log('trasferEvent', transferEvent)
            })
            .once("receipt", (receipt) => {
              $("#minting-loading").hide();
              // console.log("receipt => ", receipt);

              setMintResult(receipt);
            })
            .on("error", (error) => {
              $("#minting-loading").hide();
              console.log(error);
            });
        } else {
          nftContract.methods
            .publicMint(mintingCount)
            .send({
              from: myAddr,
              value: ethers.utils.parseEther(total_mintingfee.toString()),
            })
            .on("transactionHash", (txid) => {
              // console.log(`txid: ${txid}`)
            })
            .once("allEvents", (allEvents) => {
              // console.log('allEvents')
              // console.log(transferEvent)
            })
            .once("Transfer", (transferEvent) => {
              // console.log('trasferEvent', transferEvent)
            })
            .once("receipt", (receipt) => {
              $("#minting-loading").hide();
              // console.log("receipt => ", receipt);

              setMintResult(receipt);
            })
            .on("error", (error) => {
              $("#minting-loading").hide();
              console.log(error);
            });
        }

        break;
    }
  } catch (error) {
    console.log("error =>", error);
    $("#minting-loading").hide();
  }

  async function setMintResult(receipt) {
    // console.log("setMintResult*** receipt => ", receipt);
    // terms agree check reset
    const terms_agree = document.getElementById("terms_agree");
    terms_agree.checked = false;
    if (receipt.status) {
      let resultTokenids = [];
      if (Array.isArray(receipt.events.Transfer)) {
        receipt.events.Transfer.map((tranfervalue) => {
          resultTokenids.push(tranfervalue.returnValues.tokenId);
        });
      } else {
        resultTokenids.push(receipt.events.Transfer.returnValues.tokenId);
      }
      getTotalSupply();
      showCardList("minted_cards_deck", null);
    }
  }
}

async function nftRefund() {
  console.log("nftRefund checkInTokenIdList => ", checkInTokenIdList);
  try {
    $("#minting-loading").show();

    switch (mintingState.toString()) {
      case "2":
        // Refund
        console.log("Refund");

        if (isKaikas) {
          let estmated_gas;
          await nftContract.methods
            .refund(checkInTokenIdList)
            .estimateGas({
              from: myAddr,
            })
            .then(function (gasAmount) {
              estmated_gas = gasAmount;
              console.log("Gas => ", gasAmount);
            })
            .catch(function (error) {
              console.log("Gas error => ", error);
            });

          nftContract.methods
            .refund(checkInTokenIdList)
            .send({
              from: myAddr,
              gas: estmated_gas,
            })
            .on("transactionHash", (txid) => {
              // console.log(`txid: ${txid}`)
            })
            .once("allEvents", (allEvents) => {
              // console.log('allEvents')
              // console.log(transferEvent)
            })
            .once("Transfer", (transferEvent) => {
              // console.log('trasferEvent', transferEvent)
            })
            .once("receipt", (receipt) => {
              $("#minting-loading").hide();
              // console.log("receipt => ", receipt);

              getTotalSupply();
              showCardList("minted_cards_deck", null);
            })
            .on("error", (error) => {
              $("#minting-loading").hide();
              console.log(error);
            });
        } else {
          nftContract.methods
            .refund(checkInTokenIdList)
            .send({
              from: myAddr,
            })
            .on("transactionHash", (txid) => {
              // console.log(`txid: ${txid}`)
            })
            .once("allEvents", (allEvents) => {
              // console.log('allEvents')
              // console.log(transferEvent)
            })
            .once("Transfer", (transferEvent) => {
              // console.log('trasferEvent', transferEvent)
            })
            .once("receipt", (receipt) => {
              $("#minting-loading").hide();
              // console.log("receipt => ", receipt);
              getTotalSupply();
              showCardList("minted_cards_deck", null);
            })
            .on("error", (error) => {
              $("#minting-loading").hide();
              console.log(error);
            });
        }

        break;
    }
  } catch (error) {
    console.log("error =>", error);
    $("#minting-loading").hide();
  }
}

async function getMyCards() {
  let _TokenIdList = [];
  if (mintingState == 2) {
    // refund
    _TokenIdList = await nftContract.methods.getUnclaimedRefunds(myAddr).call();
    if (_TokenIdList.length > 0) {
      _TokenIdList = _TokenIdList.filter((tokenID) => tokenID != "0");
    }
  } else {
    // tokens of
    _TokenIdList = await nftContract.methods.tokensOf(myAddr).call();
  }
  return _TokenIdList;
}

async function setMyCardCnt(_tokenIds) {
  if (_tokenIds.length > 0) {
    const fee_wei = await nftContract.methods.MINTING_FEE().call();
    let my_fund_cnt = document.getElementById("my_fund_cnt");
    let my_fund_klay = document.getElementById("my_fund_klay");
    const my_fund_klay_wei = ethers.BigNumber.from(fee_wei).mul(
      _tokenIds.length
    );

    let my_fund_klay_gwei = ethers.utils.formatEther(my_fund_klay_wei);

    my_fund_klay_gwei = gencurrencyFormat(my_fund_klay_gwei);
    let myTokenCnt = _tokenIds.length;
    myTokenCnt = gencurrencyFormat(myTokenCnt);

    my_fund_cnt.innerText = myTokenCnt;
    my_fund_klay.innerHTML =
      my_fund_klay_gwei + '<span style="font-size: 14px"> KLAY</span>';
  } else {
    my_fund_cnt.innerText = 0;
    my_fund_klay.innerHTML = 0 + '<span style="font-size: 14px"> KLAY</span>';
  }
}

getCardInfo = async (tokenId) => {
  try {
    let tokenInfoBase64 = await nftContract.methods.tokenURI(tokenId).call();
    let jsonInfo = JSON.parse(atob(tokenInfoBase64.substring(29)));
    return jsonInfo;
  } catch (errGetCardInfo) {
    console.log(errGetCardInfo);
    return "";
  }
};

showCardList = async (kind, tokenIds) => {
  console.log("**** showCardList");
  if (mintingState == 1) {
    // public mint
    $("#mintin_btn_div").show();
    $("#claimedcnt").show();
    $("#mintinnfee").show();
  } else if (mintingState == 2) {
    // refund
    $("#mintin_btn_div").show();
    $("#claimedcnt").hide();
    $("#mintinnfee").hide();
  } else if (mintingState == 3) {
    // finished
    $("#mintin_btn_div").hide();
    $("#claimedcnt").hide();
    $("#mintinnfee").hide();
  }

  $("#minting-loading").show();
  checkInTokenIdList = [];
  let claimTokenIdList = [];

  claimTokenIdList = await getMyCards();

  let tokenId = claimTokenIdList;
  // let tokenId = [];
  const target = document.getElementById("btn_minting");
  target.disabled = true;

  setMyCardCnt(tokenId);

  if (tokenId.length == 0) {
    $("#div-minted-cards").hide();
    $("#minting-loading").hide();
    return;
  } else {
    $("#div-minted-cards").show();
  }
  let arr = [];

  const cardInfoList = await Promise.all(
    tokenId.map((id) => {
      return getCardInfo(id);
    })
  );
  cardInfoList.forEach((info, i) => {
    arr.push({ tokenId: tokenId[i], image: info.image });
  });

  arr.sort(function (a, b) {
    return parseFloat(a.tokenId) - parseFloat(b.tokenId);
  });

  // console.log(arr);
  function cardsDeck(arr) {
    document.getElementById("minted_cards_deck").innerHTML = "";

    for (let i = 0; i < arr.length; i++) {
      let card = document.createElement("div");
      let imgBox = document.createElement("div");
      let descriptionBox = document.createElement("div");
      let tokenId = document.createElement("div");
      let label = document.createElement("div");
      let checkBox = document.createElement("div");

      card.className = "card";
      imgBox.className = "imgbox";
      descriptionBox.className = "descriptionBox";
      tokenId.className = "tokenID";

      // console.log("arr[i].image => ", arr[i].image);

      label.innerHTML = "";
      img_url =
        '<label class="card-img" onclick="viewInOpensea(' +
        arr[i].tokenId +
        ')"/><img width="200" height="200" type="image/svg+xml" src="' +
        arr[i].image +
        '"/>';

      // console.log("img_url => ", img_url);

      imgBox.innerHTML = img_url;
      tokenId.innerHTML = `#${arr[i].tokenId} </label>`;
      if (mintingState == 2) {
        // refund
        checkBox.innerHTML = `<input id="checkBox${arr[i].tokenId}" style="width:20px;height:20px; " type="checkbox" class="checkbg" value="${arr[i].tokenId}" onclick ="checkBoxClick1(this)"/>`;
      }

      card.appendChild(imgBox);
      card.appendChild(descriptionBox);
      card.style.marginBottom = "10px";
      descriptionBox.appendChild(tokenId);
      if (mintingState == 2) {
        // refund

        descriptionBox.appendChild(checkBox);
        document.getElementById("my_card_cnt").innerHTML =
          '<p style="margin-bottom: 5px;font-size: 14px; color: #818181;">( ' +
          checkInTokenIdList.length +
          " / 20 ) 트랜잭션 당 최대 20장 까지 가능.</p>";
      } else {
        $(".mycardscnt").html("내 NFT : " + arr.length);
      }

      document.getElementById("minted_cards_deck").appendChild(card);
    }
  }
  cardsDeck(arr);

  checkBoxClick1 = (e) => {
    // console.log(e)
    // console.log(e.checked)
    // console.log(e.value)

    if (e.checked) {
      if (checkInTokenIdList.length == 20) {
        alert("트랜잭션 당 최대 20개까지 선택할 수 있습니다.");
        e.checked = false;
      } else {
        const target = document.getElementById("btn_minting");
        target.disabled = false;
        checkInTokenIdList.push(e.value);
      }
    } else {
      checkInTokenIdList.splice(checkInTokenIdList.indexOf(e.value), 1);
      if (checkInTokenIdList.length == 0) {
        const target = document.getElementById("btn_minting");
        target.disabled = true;
      } else {
        const target = document.getElementById("btn_minting");
        target.disabled = false;
      }
    }
    document.getElementById("my_card_cnt").innerHTML =
      '<p style="margin-bottom: 5px;font-size: 14px; color: #818181;">( ' +
      checkInTokenIdList.length +
      " / 20 ) 트랜잭션 당 최대 20장 까지 가능.</p>";
  };

  $("#minting-loading").hide();
};

function viewInOpensea(tokenid) {
  console.log("viewInOpensea =>", tokenid);
  var popup = window.open(openseaurl[chainId] + tokenid, "OpenSea");
}

function showFullStatement(kind) {
  switch (kind) {
    case "1":
      let x = document.getElementById("full_statement");
      let btn_state = document.getElementById("btn_show_full_statement");

      if (x.style.display === "none") {
        x.style.display = "block";
        btn_state.innerText = "- 간략히 보기";
      } else {
        x.style.display = "none";
        btn_state.innerText = "+ 펼쳐보기";
      }
      break;
    case "2":
      let y = document.getElementById("full_desc1");
      let btn_desc1 = document.getElementById("btn_show_desc_1");

      if (y.style.display === "none") {
        y.style.display = "block";
        btn_desc1.innerText = "- 간략히 보기";
      } else {
        y.style.display = "none";
        btn_desc1.innerText = "+ 펼쳐보기";
      }
      break;
    case "3":
      let z = document.getElementById("full_desc2");
      let btn_desc2 = document.getElementById("btn_show_desc_2");

      if (z.style.display === "none") {
        z.style.display = "block";
        btn_desc2.innerText = "- 간략히 보기";
      } else {
        z.style.display = "none";
        btn_desc2.innerText = "+ 펼쳐보기";
      }
      break;
  }
}

const banner_img = ["./asset/banner4.jpg", "./asset/banner3.jpg"];
function showBanner() {
  let loop_cnt = 0;
  setInterval(function () {
    let banner = document.getElementById("banner_div");
    banner.style.backgroundImage = "url('" + banner_img[loop_cnt] + "')";
    loop_cnt = loop_cnt + 1;
    loop_cnt == banner_img.length ? (loop_cnt = 0) : loop_cnt;
  }, 5000);
}

const body = document.querySelector("body");
const modal_mint = document.querySelector(".modal-mint");
const btnOpenPopup = document.querySelector(".btn-open-popup");
const btnClosePopupMint = document.querySelector(".btn-close-popup-mint");

const btn_minting = document.getElementById("btn_minting");

btnOpenPopup.addEventListener("click", () => {
  const status = modal_mint.classList.toggle("show");
  const target = document.getElementById("btn_minting");
  switch (mintingState.toString()) {
    case "1":
      btn_minting.innerText = "NFT 민팅";
      $("#claimedcnt").show();
      $("#mintinnfee").show();
      $("#refund_desc").hide();
      const terms_agree = document.getElementById("terms_agree");
      if (terms_agree.checked) {
        target.disabled = false;
      } else {
        target.disabled = true;
      }
      break;
    case "2":
      btn_minting.innerText = "NFT 환불";
      target.disabled = true;
      $("#claimedcnt").hide();
      $("#mintinnfee").hide();
      $("#refund_desc").show();

      break;
  }
  showCardList("minted_cards_deck", null);
  $("#funding-btn-div").hide();
});

btnClosePopupMint.addEventListener("click", () => {
  modal_mint.classList.toggle("show");
  $("#funding-btn-div").show();
});

modal_mint.addEventListener("click", (event) => {
  if (event.target === modal_mint) {
    modal_mint.classList.toggle("show");
    $("#funding-btn-div").show();
    if (!modal_mint.classList.contains("show")) {
      body.style.overflow = "auto";
    }
  }
});

function gencurrencyFormat(_val) {
  let org_val = _val;

  org_val = org_val.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

  return org_val;
}

termsAgreeCheck = (e) => {
  // console.log(e);
  // console.log(e.checked);
  // console.log(e.value);
  const target = document.getElementById("btn_minting");
  if (e.checked) {
    target.disabled = false;
  } else {
    target.disabled = true;
  }
};
