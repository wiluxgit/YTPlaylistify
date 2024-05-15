import {require} from "./lib/lib.mjs"
import * as Types from "./types.mjs"
const browser = require("webextension-polyfill")

console.info("INIT Background")
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function injectScript() {
    console.log("load link_preview")
    document.body.style.border = "5px solid green";
    browser.runtime.sendMessage(
        browser.runtime.id,
        new Types.MDebug({message: "Hello from the other side"})
    )
}

browser.runtime.onMessage.addListener(async (jsonMessage, sender, sendResponse) => {
    // Handle the message here
    const message = Types.reinstanceMessageFromJson(jsonMessage)
    console.log(`Message received:`, message);

    if (message instanceof Types.MCreatePlaylist) {
        console.log(`Execing Create playlist:`);
        await browser.tabs.create({ url: message.injectionSite }).then(async tab => {
            console.log(`New tab loaded1 id:${tab.id}`)
            await browser.scripting.executeScript({
                target: { tabId: tab.id },
                //files: ["./src/link_preview.mjs"],
                func: injectScript
            });
            console.log(`New tab loaded2 id:${tab.id}`)
        })
    } else {
        const msg = `${message} has no handler`
        sendResponse(() => { throw Error(msg) })
        console.error(msg)
        throw Error(msg)
    }
});
