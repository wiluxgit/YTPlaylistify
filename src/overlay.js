document.addEventListener("DOMContentLoaded", () => {
    const browser = require("webextension-polyfill");
    console.log("Open site")

    // Util
    const debounce = (delay, func) => {
        let timer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
            func.apply(context, args);
            }, delay);
        };
    }

    const download_website = async (url) => {
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
            "Access-Control-Allow-Origin":"*",
        }
        const site = await
            fetch(url, {headers: headers})
            .then(response => response.text())
        console.log("read site!", site)
        return site
    }
    const getTitleFromEmbedd = (webcontents) => {
        const extractTitleRegex = /([^>]*)<\/span><span class/g;
        let match;
        while ((match = extractTitleRegex.exec(webcontents)) !== null) {
            return match[1];
        }
    }
    const spotifyEmbedToYtSearch = (webcontents) => {
        const extractListItemRegex = /<li class="TracklistRow_trackListRow.*?>(.*?)<\/li>/g;
        const extractTitleRegex = /class="TracklistRow_title.*?>(.*?)<\/.*?>/g;
        const extractArtistRegex = /class="TracklistRow_subtitle.*?>([^>]*?)<\/h4/g;

        const ytUrls = [];
        let match;
        while ((match = extractListItemRegex.exec(webcontents)) !== null) {
            const listItem = match[1];
            const titleMatch = extractTitleRegex.exec(listItem);
            const artistMatch = extractArtistRegex.exec(listItem);

            if (titleMatch && artistMatch) {
                const title = titleMatch[1];
                const artist = artistMatch[1];

                const escapeTerm = encodeURIComponent(`Nightcore ${title}, ${artist}`);
                const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${escapeTerm}`;

                ytUrls.push(youtubeSearchUrl);
            }
        }

        return ytUrls;
    }

    // Begin code
    const H_url = document.getElementById("H_url");
    const H_to_youtube = document.getElementById("H_to_youtube");
    const H_console = document.getElementById("H_console");

    const onUrlChanged = debounce(100, async () =>  {
        console.log("H_url", H_url.value)
        const extract_url = /\/playlist\/(.+)\?/;
        const match = H_url.value.match(extract_url);
        const spotify_url = match ? `https://open.spotify.com/embed/playlist/${match[1]}` : null;
        console.log("spotify_url", spotify_url)
        const webcontents = download_website(spotify_url)
        const playlistTitle = getTitleFromEmbedd(webcontents)
        const ytSearchUrls = spotifyEmbedToYtSearch(webcontents)
        console.log("playlistTitle", playlistTitle)
        console.log("ytSearchUrls", ytSearchUrls)
    })


    H_url.addEventListener("input", onUrlChanged);
    // default with current page
    browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var url = tabs[0].url;

        //H_text.value = url
        H_url.value = "https://open.spotify.com/playlist/5fzmx31hsQDzbj6Pi57UFQ?si=qCjMDaZ-Th6ZHZ-THFE5OQ&pi=e-kJppvAyuQfWI";

        onUrlChanged()
    })
})