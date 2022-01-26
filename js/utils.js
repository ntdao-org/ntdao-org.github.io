function getLink(addr, chainId) {
  // console.log("getLink : addr => ", addr);
  var explorer;
  if (chainId == 8217) {
    explorer = "https://scope.klaytn.com";
  } else if (chainId == 1001) {
    explorer = "https://baobab.scope.klaytn.com";
  } else {
    explorer = "";
    console.log("unsupported chainid " + chainId);
  }
  var shortAddr =
    addr.substring(0, 6) + "...." + addr.substring(addr.length - 4);

  if (addr.length == 42) {
    return (
      '<a target="_blank" style="color:var(----primary-color);" href="' +
      explorer +
      "/account/" +
      addr +
      '">' +
      shortAddr +
      "</a>"
    );
  } else {
    return (
      '<a target="_blank" style="color:var(----primary-color);" href="' +
      explorer +
      "/tx/" +
      addr +
      '">' +
      shortAddr +
      "</a>"
    );
  }
}

function getOpenSeaLink(chainId) {
  var explorer;
  if (chainId == 8217) {
    explorer = "https://opensea.io/collection/national-treasure-dao";
  } else if (chainId == 1001) {
    explorer =
      "https://testnets.opensea.io/collection/national-treasure-dao-nft-v3";
  } else {
    explorer = "";
    console.log("unsupported chainid " + chainId);
  }

  return (
    '<a target="_blank" style="text-decoration: underline;color:coral;" href="' +
    explorer +
    '">Fortress-Arena NFT</a>'
  );
}

function getMyOpenSeaLink(chainId, _myaddr) {
  // console.log("getMyOpenSeaLink _myaddr => ", _myaddr);
  var explorer;
  if (chainId == 8217) {
    if (_myaddr !== undefined) {
      explorer =
        "https://opensea.io/" +
        _myaddr +
        "/national-treasure-dao?search[sortBy]=LISTING_DATE";
    } else {
      explorer = "https://opensea.io/collection/national-treasure-dao";
    }
  } else if (chainId == 1001) {
    if (_myaddr !== undefined) {
      explorer =
        "https://testnets.opensea.io/" +
        _myaddr +
        "/national-treasure-dao-nft-v3?search[sortBy]=LISTING_DATE";
    } else {
      explorer =
        "https://testnets.opensea.io/collection/national-treasure-dao-nft-v3";
    }
  } else {
    explorer = "";
    console.log("unsupported chainid " + chainId);
  }

  return (
    '<a target="_blank" style="text-decoration: underline;color:var(----primary-color);" href="' +
    explorer +
    '">National Treasure DAO NFT</a>'
  );
}

function getMyOpenSeaUrl(chainId, _myaddr) {
  // console.log("getMyOpenSeaLink _myaddr => ", _myaddr);
  var explorer;
  if (chainId == 8217) {
    if (_myaddr !== undefined) {
      explorer =
        "https://opensea.io/" +
        _myaddr +
        "/national-treasure-dao?search[sortBy]=LISTING_DATE";
    } else {
      explorer = "https://opensea.io/collection/national-treasure-dao";
    }
  } else if (chainId == 1001) {
    if (_myaddr !== undefined) {
      explorer =
        "https://testnets.opensea.io/" +
        _myaddr +
        "/national-treasure-dao-nft-v3?search[sortBy]=LISTING_DATE";
    } else {
      explorer =
        "https://testnets.opensea.io/collection/national-treasure-dao-nft-v3";
    }
  } else {
    explorer = "";
    console.log("unsupported chainid " + chainId);
  }

  return explorer;
}

function goMintGuide() {
  var popup = window.open("./guide/mintingguide.html");
}
function getWindowWidth() {
  var width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  return width;
}

function getWindowHeight() {
  var height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
  return height;
}

const countDownTimer = function (id, date) {
  var _vDate = new Date(date);
  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;
  var timer;

  function showRemaining() {
    var now = new Date();
    var distDt = _vDate - now;
    if (distDt <= 0) {
      clearInterval(timer);
      document.getElementById("div-countdown").style.display = "none";
      return;
    }
    var days = Math.floor(distDt / _day);
    var hours = Math.floor((distDt % _day) / _hour);
    var minutes = Math.floor((distDt % _hour) / _minute);
    var seconds = Math.floor((distDt % _minute) / _second);

    if (days > 0) {
      document.getElementById(id).textContent = days + "Day ";
      document.getElementById(id).textContent += hours + " : ";
    } else {
      document.getElementById(id).textContent = hours + " : ";
    }
    document.getElementById(id).textContent += minutes + " : ";
    document.getElementById(id).textContent += seconds + "";
  }
  timer = setInterval(showRemaining, 1000);
};

function convDatetoTime(date) {
  let convDate = new Date(date);
  return convDate;
}

// use event modal popup
function setCookie(name, value, expiredays) {
  var today = new Date();
  console.log(today.getDate());
  today.setDate(today.getDate() + expiredays);

  document.cookie =
    name + "=" + value + "; path=/; expires=" + today.toGMTString();
}

function getCookie(name) {
  var cookie = document.cookie;

  if (document.cookie != "") {
    var cookie_array = cookie.split("; ");
    console.log(cookie_array);
    for (var index in cookie_array) {
      var cookie_name = cookie_array[index].split("=");
      if (cookie_name[0] == "popEventToday") {
        return cookie_name[1];
      }
    }
  }
  return;
}

function delCookie(_name) {
  let date = new Date();
  date.setDate(date.getDate() - 100);
  document.cookie = _name + "= ; expires=" + date.toGMTString();
}
