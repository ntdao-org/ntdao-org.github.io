const setTheme = (theme) => (document.documentElement.className = theme);
setTheme("aquamarine"); // initialize
// bgImageScale();
countDownTimer("countdown", "2022-01-06T13:00:00.000Z");
// countDownTimer("countdown", "01/06/2022 12:33 PM");
let nftContract;

let chainId = 8217;
const networkList = {
  1: "Klaytn Mainnet",
  4: "Klaytn Testnet",
};
let myAddr;
let mintingFee;
let totalsupplyInterval;

let openMyCardsView = false;
let mintingState = 0; // 0:minting is not allowed , 1: pre minting , 2: public minting , 3: public minting is not allowed
let multiCount = 0;
let isKaikas = false;

const nftAddress = {
  8217: "0x1340daa8DB39342Bc6d66aB9e62b8f7748F666e9",
  1001: "0x1340daa8DB39342Bc6d66aB9e62b8f7748F666e9",
};

const nftAbi = {
  8217: ntdabi_klaytn_mainnet,
  1001: ntdabi_klaytn_testnet,
};

showBanner();

window.addEventListener("load", function () {
  loadWeb3();
  if (typeof window.web3 !== "undefined") {
    watchChainAccount();
    startApp();
  } else {
    alert("You need to install dapp browser first to use this site!");
  }
});

function loadWeb3() {
  if (typeof window.ethereum !== "undefined") {
    window.web3 = new Web3(window.ethereum);
    isKaikas = false;
  } else {
    window.web3 = new Web3(window.caver);
    isKaikas = true;
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
  // clearInterval(totalsupplyInterval);
  try {
    var currentChainId = await web3.eth.getChainId();
    chainId = currentChainId;

    if (chainId == 8217 || chainId == 1001) {
      // if (chainId == 4) {
      // $("#div-network").show();
      // $("#network-info").hide();
      $(".current-network").html(networkList[chainId]);
      await getAccount();
    } else {
      // $("#div-network").hide();
      // $("#network-info").show();
      $(".my-address").html("지갑이 Klaytn 네트웍에 연결되어있지 않습니다.");
    }

    // initializeClock();
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
        console.log("accounts => ", accounts);
        myAddr = accounts[0];
        $(".my-address").html(getLink(myAddr, chainId));
        startApp();
        //   $("#div-mintable").show();
        //   isMintingAvailable(true);
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
        //   $("#div-mintable").show();
        //   isMintingAvailable(true);
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
  }
}

async function getContracts() {
  if (isKaikas) {
    nftContract = new caver.klay.Contract(nftAbi[chainId], nftAddress[chainId]);
  } else {
    nftContract = new web3.eth.Contract(nftAbi[chainId], nftAddress[chainId]);
  }
  console.log("getContracts nftContract =>", nftContract);
  $(".nft-address").html(getLink(nftAddress[chainId], chainId));
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
  console.log("mintingState =>", mintingState);
  switch (mintingState.toString()) {
    case "0":
      btn_mint.disabled = true;
      btn_mint.innerText = "민팅 준비중입니다. ";
      break;
    case "1":
      if (chainId == 1001) {
        btn_mint.disabled = false;
      } else {
        btn_mint.disabled = true;
      }
      btn_mint.innerText = "민팅 참여하기 ( 준비 중 )";
      break;
    case "2":
      btn_mint.disabled = false;
      btn_mint.innerText = "NFT 환불";
      break;
    case "3":
      btn_mint.disabled = true;
      btn_mint.innerText = "민팅이 종료되었습니다.";
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
      break;
    default:
      multiCount = 0;
      break;
  }

  console.log("getMultiClaimCount multiCount => ", multiCount);

  // if (mintingState == 1) {
  //   $(".mintingfee").html("[ " + fee_gwei + " KLAY ]");
  //   $(".description").html(
  //     "<p>The price of 1 NFT is " +
  //       fee_gwei +
  //       " KLAY, and you can claim up to " +
  //       multiCount +
  //       " at a time.</p>"
  //   );
  // }

  // // console.log("multiCount -> ", multiCount);

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
      optionItem = optionItem + '<option value="' + i + '" >' + i + "</option>";
    }
  }
  claimcount.innerHTML = optionItem;
}

async function getTotalSupply() {
  // clearInterval(totalsupplyInterval);

  let maxCnt = 0;
  let mintedCnt = 0;
  mintedCnt = await nftContract.methods.totalSupply().call();
  maxCnt = await checkMintingState(mintedCnt);

  console.log("getTotalSupply   mintedCnt=> ", mintedCnt);

  $(".claimedcnt").html(mintedCnt + "/" + maxCnt);
  showCardList("minted_cards_deck", null);
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
  switch (mintingState.toString()) {
    case "0":
      break;
    case "1":
      // public mint
      maxCnt = await nftContract.methods.MAX_PUBLIC_ID().call();
      if (parseInt(_mintedCnt) == parseInt(maxCnt)) {
        btn_mint.disabled = true;
      } else {
        btn_mint.disabled = false;
      }
      if (chainId == 1001) {
        btn_mint.disabled = false;
      } else {
        btn_mint.disabled = true;
      }
      break;
    case "2":
      // refund
      btn_mint.disabled = false;
      break;
  }
  return maxCnt;
}

async function nftMint() {
  try {
    $("#minting-loading").show();

    console.log("mintingState -> ", mintingState);
    // getMinting Fee
    const fee_wei = await nftContract.methods.MINTING_FEE().call();
    const mintingCount = $("#claimcount option:selected").val();

    const wei_value = ethers.BigNumber.from(fee_wei).mul(mintingCount);
    const total_mintingfee = ethers.utils.formatEther(wei_value);

    console.log("total_mintingfee =>", total_mintingfee);

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
              console.log("receipt => ", receipt);

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
              console.log("receipt => ", receipt);

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
    if (receipt.status) {
      // $("#div-mint-result").show();
      let resultTokenids = [];
      if (Array.isArray(receipt.events.Transfer)) {
        receipt.events.Transfer.map((tranfervalue) => {
          // console.log(
          //   "receipt.events.Transfer => ",
          //   tranfervalue.returnValues.tokenId
          // );
          resultTokenids.push(tranfervalue.returnValues.tokenId);
          // console.log("resultTokenids => ", resultTokenids);
        });
      } else {
        // console.log(
        //   "receipt.events.Transfer=>",
        //   receipt.events.Transfer.returnValues.tokenId
        // );
        resultTokenids.push(receipt.events.Transfer.returnValues.tokenId);
        // console.log("resultTokenids => ", resultTokenids);
      }
      console.log("resultTokenids => ", resultTokenids);
      getTotalSupply();
    }
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
  console.log("showCardList kind =>", kind);
  console.log("showCardList tokenIds =>", tokenIds);
  $("#minting-loading").show();
  let claimTokenIdList = [];

  claimTokenIdList = await nftContract.methods.tokensOf(myAddr).call();

  let tokenId = claimTokenIdList;
  // let tokenId = [];

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
      card.className = "card";
      imgBox.className = "imgbox";
      descriptionBox.className = "descriptionBox";
      tokenId.className = "tokenID";

      label.innerHTML = "";
      imgBox.innerHTML = `<label class="card-img" onclick="viewInOpensea(${arr[i].tokenId})" />
          <img style="width: auto; height: auto; max-width: 200px; "  src="${arr[i].image}" ></img>
          `;

      tokenId.innerHTML = `#${arr[i].tokenId} </label>`;
      card.appendChild(imgBox);
      card.appendChild(descriptionBox);
      descriptionBox.appendChild(tokenId);
      card.style.marginBottom = "10px";

      $(".mycardscnt").html("내 NFT : " + arr.length);

      document.getElementById("minted_cards_deck").appendChild(card);
    }
  }

  cardsDeck(arr);
  $("#minting-loading").hide();
};

function showFullStatement(kind) {
  switch (kind) {
    case "1":
      let x = document.getElementById("full_statement");
      let btn_state = document.getElementById("btn_show_full_statement");

      if (x.style.display === "none") {
        x.style.display = "block";
        btn_state.innerText = "- 간략히";
      } else {
        x.style.display = "none";
        btn_state.innerText = "+ 전문보기";
      }
      break;
    case "2":
      let y = document.getElementById("full_desc1");
      let btn_desc1 = document.getElementById("btn_show_desc_1");

      if (y.style.display === "none") {
        y.style.display = "block";
        btn_desc1.innerText = "- 간략히";
      } else {
        y.style.display = "none";
        btn_desc1.innerText = "+ 전문보기";
      }
      break;
    case "3":
      let z = document.getElementById("full_desc2");
      let btn_desc2 = document.getElementById("btn_show_desc_2");

      if (z.style.display === "none") {
        z.style.display = "block";
        btn_desc2.innerText = "- 간략히";
      } else {
        z.style.display = "none";
        btn_desc2.innerText = "+ 전문보기";
      }
      break;
  }
}

const banner_img = ["./asset/banner2.jpg", "./asset/banner1.jpg"];
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
const modal = document.querySelector(".modal-popup");
const btnOpenPopup = document.querySelector(".btn-open-popup");
const btnClosePopup = document.querySelector(".btn-close-popup");

btnOpenPopup.addEventListener("click", () => {
  modal.classList.toggle("show");
  $("#funding-btn-div").hide();
});

btnClosePopup.addEventListener("click", () => {
  modal.classList.toggle("show");
  $("#funding-btn-div").show();
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.toggle("show");
    $("#funding-btn-div").show();
    // bonus_claim_complete.innerHTML = "";

    if (!modal.classList.contains("show")) {
      body.style.overflow = "auto";
    }
  }
});
