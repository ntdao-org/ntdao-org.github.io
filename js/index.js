const setTheme = (theme) => (document.documentElement.className = theme);
setTheme("aquamarine"); // initialize
// bgImageScale();
countDownTimer("countdown", "2022-01-06T13:00:00.000Z");
// countDownTimer("countdown", "01/06/2022 12:33 PM");
// let nftAddress = "0xD732C56BC9008272D780F339f97de79089c34f4B"; // rinkeby
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

const nftAddress = {
  8217: "0x6466514368A0c2E1396BC3164495c6f90cBA92F6",
  1001: "0xD732C56BC9008272D780F339f97de79089c34f4B",
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
  } else {
    window.web3 = new Web3(
      "https://mainnet.infura.io/v3/302b2ccfd49a40d480567a132cb7eb1d"
    );
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

    var accounts = await web3.eth.getAccounts();

    if (accounts.length > 0) {
      // myAddr = web3.utils.toChecksumAddress(accounts[0]);
      myAddr = accounts[0];

      $("#div-myaddress").show();
      $(".my-address").html(getLink(myAddr, chainId));
      $("#content_body").show();
      $("#connect-btn").hide();
      $("#my-addr-btn").show();
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
  if (typeof ethereum === "undefined") {
    return showMsg(noAddrMsg);
  }

  ethereum
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

async function getContracts() {
  nftContract = new web3.eth.Contract(nftAbi[chainId], nftAddress[chainId]);
  $(".nft-address").html(getLink(nftAddress[chainId], chainId));
}

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

const modal = document.querySelector(".modal-popup");
const btnOpenPopup = document.querySelector(".btn-open-popup");
const btnClosePopup = document.querySelector(".btn-close-popup");

btnOpenPopup.addEventListener("click", () => {
  modal.classList.toggle("show");
  const target = document.getElementById("bonus-claim-btn");
  target.disabled = true;

  if (modal.classList.contains("show")) {
    body.style.overflow = "hidden";
  }
  showBonusClaimCardList();
});

btnClosePopup.addEventListener("click", () => {
  modal.classList.toggle("show");
  bonus_claim_complete.innerHTML = "";

  const target = document.getElementById("bonus-claim-btn");
  target.disabled = true;

  if (!modal.classList.contains("show")) {
    body.style.overflow = "auto";
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.toggle("show");
    bonus_claim_complete.innerHTML = "";

    if (!modal.classList.contains("show")) {
      body.style.overflow = "auto";
    }
  }
});
