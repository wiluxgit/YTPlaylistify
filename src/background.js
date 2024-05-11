var browser = require("webextension-polyfill");

console.log("preload")
console.log(browser)

browser.runtime.onMessage.addListener(async (msg, sender) => {
    console.log(`Runtime message: ${msg}`)
});

browser.action.onClicked.addListener(() => {
    console.log("Clicked Extention Button")
});

console.log("post load")