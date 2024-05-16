const browser = require("webextension-polyfill")

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)
    const params = {}
    for (const [key, value] of urlParams) {
        params[key] = value
    }
    return params
}

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

function createOverlayPopup() {
    // Create a div element for the overlay popup
    const H_overlay = document.createElement("div")
    H_overlay.style.position = "fixed"
    H_overlay.style.top = "8%"
    H_overlay.style.left = "0"
    H_overlay.style.width = "200px"
    H_overlay.style.height = "90%"
    H_overlay.style.backgroundColor = "rgba(50, 50, 50, 0.8)" // semi-transparent black background
    H_overlay.style.zIndex = "9999" // Make sure the overlay is on top of everything
    H_overlay.style.background = "linear-gradient(45deg, rgba(50, 50, 50, 0.8) 25%, rgba(30, 30, 30, 0.8) 25%, rgba(30, 30, 30, 0.8) 50%, rgba(50, 50, 50, 0.8) 50%, rgba(50, 50, 50, 0.8) 75%, rgba(30, 30, 30, 0.8) 75%, rgba(30, 30, 30, 0.8))"
    H_overlay.style["background-size"] = "40px 40px"
    H_overlay.style["box-shadow"] = "0 0 20px rgba(0, 0, 0, 0.8)"

    // Create some content for the overlay popup
    const H_popupContent = document.createElement("div")
    H_popupContent.textContent = "This is an overlay popup!"
    H_popupContent.style.color = "#fff" // white text color
    H_popupContent.style.position = "absolute"
    H_popupContent.style.top = "50%"
    H_popupContent.style.left = "50%"
    H_popupContent.style.transform = "translate(-50%, -50%)" // center the content

    // Add the content to the overlay
    H_overlay.appendChild(H_popupContent)

    // Add links
    const params = getUrlParams()
    for (const key in params) {
        const br = document.createElement("br")
        H_popupContent.appendChild(br)
        const textarea = document.createElement("textarea")
        textarea.value = `${key}: ${params[key]}`
        H_popupContent.appendChild(textarea)
    }

    // Append the overlay to the document body
    document.body.appendChild(H_overlay)
}

async function postRequest() {
    console.log("pre fetch request")
    await fetch(`https://www.youtube.com/youtubei/v1/playlist/create?prettyPrint=false`, {
        method: "POST",
        body: JSON.stringify({
            "title": "foobaz",
            "privacyStatus": "UNLISTED",
            "videoIds": [
                "4f_phiGot7w"
            ]
        })
    }).catch(e => {
        console.error(e)
    })
    console.log("post fetch request")
}

async function clickPlaylistButton() {
    const H_playlistButton = document.querySelector('[title="Save"][aria-label="Save to playlist"]');
    console.log(">>>>>>>>>>>>>>1", H_playlistButton)
    if (!H_playlistButton) {
        throw Error("could not find playlist button")
    }
    H_playlistButton.click()
    await sleep(1000)
    const H_createNewPlaylist = document.querySelector('tp-yt-paper-item[role="link"]');
    console.log(">>>>>>>>>>>>>>2", H_createNewPlaylist)
    if (!H_createNewPlaylist) {
        throw Error("could not find playlist button")
    }
    H_createNewPlaylist.click()
    await sleep(1000)
    const H_createButton = document.querySelector('button[aria-label="Create"] > div > span[role="text"]');
    //const H_createButton = document.querySelector('ytd-button-renderer[aria-label="Create"]');
    console.log(">>>>>>>>>>>>>>3", H_createButton)
    if (!H_createButton) {
        throw Error("could not find playlist button")
    }
    H_createButton.click()
    await sleep(1000)
}

document.body.style.border = "5px solid green"
console.log("load link_preview")
createOverlayPopup()
clickPlaylistButton()
//postRequest()