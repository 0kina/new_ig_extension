/**
 * `await sleep(millisecond)`のように使う．
 */
const sleep = (millisecond) => {
  return new Promise(resolve => {
    setTimeout(resolve, millisecond)
  });
}

const basicTab = "basic";
const darkTab = "dark";
const optionTab = "option";
const levelTab = "level";
const rankTab = "rank";
const autoTab = "auto";
const shineTab = "shine";
const worldTab = "world";
const chipTab = "chip";
const trophyTab = "trophy";

const addHotKeyInfo = async (btn, key) => {
  // この関数を呼び出す直前にボタンの文字列が変化している場合，`btn.textContent`によって
  // 古いtextContentにアクセスする可能性がある．
  // 短時間だけスリープさせることで正しいテキストにアクセスできるようにする．
  await sleep(20);
  btn.textContent = `${btn.textContent}[${key}]`;
}

// buttons
let tabBtns = {};
// basic tab
let levelResetBtn;
let rankResetBtn;
let generatorBtns = [];
// dark tab
let spendBrightnessBtn1;
// shine tab
let spendShineBtn1, spendBrightnessBtn10, spendBrightnessBtn100, spendBrightnessBtn1000;
// world tab
let worldBtns = [];

const initialize = () => {
  currentTab = basicTab
}

initialize();

// tab buttons
tabs = Array.from(document.getElementsByClassName("tabs")[0].children)
for (tab of tabs) {
  const tabBtn = tab.firstElementChild;
  const tabId = tab.id;
  tabBtn.addEventListener("click", () => {
    console.log("Next tab: " + tabId);
    currentTab = tabId;
  });
  const hotkey = tab.id[0];
  addHotKeyInfo(tabBtn, hotkey);
  tabBtns[hotkey] = tabBtn;
}

const pushTabHotKey = (event) => {
  if (!(event.key in tabBtns)) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  tabBtns[event.key].dispatchEvent(new MouseEvent("click"))
}

// find buttons
const findBasicTabBtns = () => {
  if (document.getElementById("levelreset")) {
    if (typeof levelResetBtn === "undefined") {
      levelResetBtn = document.getElementById("levelreset").firstElementChild;
      addHotKeyInfo(levelResetBtn, "Shift + l");
    }
  } else {
    levelResetBtn = undefined
  }
  if (document.getElementById("rankreset")) {
    if (typeof rankResetBtn === "undefined") {
      rankResetBtn = document.getElementById("rankreset").firstElementChild;
      addHotKeyInfo(rankResetBtn, "Shift + r");
    }
  } else {
    rankResetBtn = undefined;
  }
  if (generatorBtns.length === 0) {
    genContainter = document.getElementsByClassName("generators-container")[0];
    for (let i = 0; i < 8; ++i) {
      const generator = genContainter.children[i];
      generatorBtns.push(generator.children[1]);
      addHotKeyInfo(generatorBtns[i], i + 1);
    }
  }
}

setInterval(() => {
  if (currentTab === basicTab) {
    findBasicTabBtns();
  }
}, 300);

function TabInfo(tabName, tabBtn) {
  this.tabName = tabName;
  this.tabBtn = tabBtn;
}

const pushBasicTabHotKey = (event) => {
  if (currentTab != basicTab) return;
  if (event.key == "L" && typeof levelResetBtn !== "undefined") {
    levelResetBtn.dispatchEvent(new MouseEvent("click"));
  } else if (event.key == "R" && typeof rankResetBtn !== "undefined") {
    rankResetBtn.dispatchEvent(new MouseEvent("click"));
  }
  const oneToEightRegExp = new RegExp(/^[1-8]$/)
  if (oneToEightRegExp.test(event.key)) {
    const btnIdx = parseInt(event.key) - 1
    generatorBtns[btnIdx].dispatchEvent(new MouseEvent("click"))
    genContainter = document.getElementsByClassName("generators-container")[0];
    const generator = genContainter.children[btnIdx];
    const oldText = generatorBtns[btnIdx].textContent;
    generatorBtns[btnIdx] = generator.children[1];
    // 発生器の価格変更に伴いボタンが更新されるため，ホットキー表示を再度追加する．
    addHotKeyInfo(generatorBtns[btnIdx], btnIdx + 1, oldText);
  }
}

// dark tab
{
  let tempElem = document.getElementById("darkcoinamount").nextElementSibling;
  while ( tempElem.className != "darkgenerator") {
    tempElem = tempElem.nextElementSibling;
  }
  while (tempElem.className == "darkgenerator") {
    tempElem = tempElem.nextElementSibling;
  }
  spendBrightnessBtn1 = tempElem.firstElementChild;
  console.assert(spendBrightnessBtn1.className == "spendbrightnessbutton");
}
addHotKeyInfo(spendBrightnessBtn1, "Shift + 1");
const pushDarkTabHotKey = (event) => {
  if (currentTab != darkTab) return;
  if (event.key == "!") {
    spendBrightnessBtn1.dispatchEvent(new MouseEvent("click"));
  }
}

// rank tab
{
  const inf = 1000000
  levelShopDiscountThreshold = [
    [4, 1], [16, 1], [32, 2], [36, 1], [64, 1], [100, 1], [108, 3],
    [128, 2], [256, 4], [288, 2], [432, 3], [500, 5], [512, 2], [800, 2],
    [972, 3], [1024, 4], [1728, 3], [2000, 5], [2304, 4], [2700, 3],
    [4096, 4], [4500, 5], [6400, 4], [8000, 5], [12500, 5], [inf, 0]
  ]
  const addLevelShopNextDiscountInfo = (isInitial) => {
    let levelShopTextElement = document.getElementsByClassName("levelshop")[0];
    const levelShopText = levelShopTextElement.innerText;
    const levelPurchaseCount = parseInt(/累計購入回数: (\d+)/.exec(levelShopText)[1]);
    let currentLevelShopDiscountClass = 0;
    while (levelShopDiscountThreshold[currentLevelShopDiscountClass][0] <= levelPurchaseCount) {
      ++currentLevelShopDiscountClass;
    }
    const [threshold, levelShopItemId] = levelShopDiscountThreshold[currentLevelShopDiscountClass];
    if (isInitial) {
      const nextDiscountElement = levelShopTextElement.appendChild(document.createElement("p"));
      if (threshold === inf) {
        nextDiscountElement.innerHTML += `これ以上の価格減少はありません`;
      } else {
        nextDiscountElement.innerHTML += `次回の価格減少: ${threshold}回、段位効力${levelShopItemId}`;
      }
    } else {
      const nextDiscountElement = levelShopTextElement.lastElementChild;
      if (threshold === inf) {
        nextDiscountElement.innerHTML = nextDiscountElement.innerHTML.replace(
          /\d+回、段位効力\d/,
          `これ以上の価格減少はありません`
        );
      } else {
        nextDiscountElement.innerHTML = nextDiscountElement.innerHTML.replace(
          /\d+回、段位効力\d/,
          `${threshold}回、段位効力${levelShopItemId}`
        );
      }
    }
  }
  addLevelShopNextDiscountInfo(true);
  setInterval(() => {
    if (currentTab === rankTab) {
      addLevelShopNextDiscountInfo(false);
    }
  }, 1000);
}

// shine tab
{
  const spendShineButtons = document.getElementsByClassName("spendshinebutton");
  if (spendShineButtons.length >= 1) spendShineBtn1 = spendShineButtons[0];
  if (spendShineButtons.length >= 2) spendShineBtn10 = spendShineButtons[1];
  if (spendShineButtons.length >= 3) spendShineBtn100 = spendShineButtons[2];
  if (spendShineButtons.length >= 4) spendShineBtn1000 = spendShineButtons[3];
}
if (typeof spendShineBtn1 !== "undefined") addHotKeyInfo(spendShineBtn1, "Shift + 1");
if (typeof spendShineBtn1 !== "undefined") addHotKeyInfo(spendShineBtn10, "Shift + 2");
if (typeof spendShineBtn1 !== "undefined") addHotKeyInfo(spendShineBtn100, "Shift + 3");
const pushShineTabHotKey = (event) => {
  if (currentTab != shineTab) return;
  if (typeof spendShineBtn1 !== "undefined" && event.key == "!") {
    spendShineBtn1.dispatchEvent(new MouseEvent("click"));
  }
  if (typeof spendShineBtn10 !== "undefined" && event.key == "\"") {
    spendShineBtn10.dispatchEvent(new MouseEvent("click"));
  }
  if (typeof spendShineBtn100 !== "undefined" && event.key == "#") {
    spendShineBtn100.dispatchEvent(new MouseEvent("click"));
  }
}

// world buttons
worlds = Array.from(document.getElementsByClassName("worlds"))
for (let i = 0; i < 10; ++i) {
  const worldBtn = worlds[i].firstElementChild;
  worldBtns.push(worldBtn);
  addHotKeyInfo(worldBtn, i + 1);
}
const pushWorldTabHotKey = (event) => {
  console.log(currentTab);
  if (currentTab != worldTab) return;
  const zeroToNingeRegExp = new RegExp(/^[0-9]$/)
  console.log("foo");
  if (zeroToNingeRegExp.test(event.key)) {
    console.log("HI");
    const btnIdx = (parseInt(event.key) + 9) % 10;
    console.log(btnIdx);
    worldBtns[btnIdx].dispatchEvent(new MouseEvent("click"))
  }
}

document.addEventListener("keydown", pushTabHotKey);
document.addEventListener("keydown", pushBasicTabHotKey);
document.addEventListener("keydown", pushDarkTabHotKey);
document.addEventListener("keydown", pushShineTabHotKey);
document.addEventListener("keydown", pushWorldTabHotKey);
