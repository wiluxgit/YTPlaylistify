const LIB = {}
const isFirefox = navigator.userAgent.indexOf("Firefox") != -1
LIB["webextension-polyfill"] = isFirefox ? require("webextension-polyfill") : chrome,
LIB["alpinejs"] = require("alpinejs")
module.exports=LIB