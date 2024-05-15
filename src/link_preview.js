document.addEventListener("DOMContentLoaded", () => {
    const H_arguments = document.getElementById("H_arguments");

    // Function to get URL parameters
    function getUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }

    // Function to create textareas for each argument
    console.log("load link_preview")
    const params = getUrlParams();
    for (const key in params) {
        const textarea = document.createElement("textarea");
        textarea.value = `${key}: ${params[key]}`;
        H_arguments.appendChild(textarea);
    }
})