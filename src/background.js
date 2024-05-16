import {require} from "./generated/lib.mjs"
import * as Types from "./types.mjs"
const browser = require("webextension-polyfill")

console.info("INIT Background")
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function injectScript() {
    console.log("load link_preview")
    console.log("load link_preview")
    console.log("load link_preview")
    alert("load link_preview")
}

browser.runtime.onMessage.addListener(async (jsonMessage, sender, sendResponse) => {
    // Handle the message here
    const message = Types.reinstanceMessageFromJson(jsonMessage)
    console.log(`Message received:`, message);

    if (message instanceof Types.MCreatePlaylist) {
        console.log(`Execing Create playlist:`);
        await browser.tabs.create({ url: message.injectionSite }).then(async tab => {
            try {
                console.log(`New tab loaded1 id:${tab.id}`)
                await browser.scripting.executeScript({
                    target: {
                        tabId: tab.id,
                        allFrames: true,
                    },
                    files: ["src/generated/lib.js", "src/injection_scripts/yt.js"],
                    injectImmediately: true,
                    //func: injectScript,
                });
                console.log(`New tab loaded2 id:${tab.id}`)
            } catch (err) {
                console.error(`failed to execute script: ${err}`);
            }
        })
    } else {
        const msg = `${message} has no handler`
        sendResponse(() => { throw Error(msg) })
        console.error(msg)
        throw Error(msg)
    }
});
