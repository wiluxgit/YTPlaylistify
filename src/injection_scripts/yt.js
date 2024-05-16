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

function createOverlayPopup() {
    // Create a div element for the overlay popup
    const H_overlay = document.createElement("div")
    H_overlay.style.position = "fixed"
    H_overlay.style.top = "0"
    H_overlay.style.left = "0"
    H_overlay.style.width = "30%"
    H_overlay.style.height = "100%"
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

document.body.style.border = "5px solid green"
console.log("load link_preview")
createOverlayPopup()