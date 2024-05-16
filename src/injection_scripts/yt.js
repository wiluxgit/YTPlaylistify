console.log("load link_preview")
alert("load link_preview")
document.body.style.border = "5px solid green";

const browser = require("webextension-polyfill")
browser.runtime.sendMessage(
    browser.runtime.id,
    {asdasdasd: "Hello from the other side"}
)

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    return params;
}

const H_arguments = document.getElementById("H_arguments");
const params = getUrlParams();
for (const key in params) {
    const textarea = document.createElement("textarea");
    textarea.value = `${key}: ${params[key]}`;
    H_arguments.appendChild(textarea);
}