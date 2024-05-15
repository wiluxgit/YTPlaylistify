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
    /*
    const getTitleFromEmbedd = (webcontents) => {
        const extractTitleRegex = /([^>]*)<\/span><span class/g;
        let match;
        while ((match = extractTitleRegex.exec(webcontents)) !== null) {
            return match[1];
        }
    }*/
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

    class Track {
        constructor({title, artist}) {
            this.title = title;
            this.artist = artist;
        }
        toString() {
            return `${this.constructor.name}{${this.title} by ${this.artist}}`;
        }
    }

    const getTitleFromSpotifyEmbedd = async (htmlComponent) => {
        return new Promise((resolve, reject) => {
            htmlComponent.querySelectorAll('div[class*="Marquee_container"]').forEach(marqContainer => {
                console.log("Marquee_container")
                marqContainer.querySelectorAll('div[class*="Marquee_inner"]').forEach(marq => {
                    console.log("Marquee_inner")
                    marq.querySelectorAll('span').forEach(span => {
                        if (span.childNodes.length > 1) {
                            return
                        }
                        const spanContents = span.innerHTML.trim()
                        resolve(spanContents) // Assuming first match is the playlist title
                    })
                })
            })
            reject("could not find playlist title")
        })
    }
    const getSongsFromSpotifyEmbedd = (htmlComponent) => {
        const tracks = []
        const olElement =  htmlComponent.querySelector('ol');
        if (olElement) {
            const liElements = olElement.querySelectorAll('li');
            liElements.forEach(li => {
                const htlm_title = li.querySelector('[class*="_title_"]')
                const html_artist = li.querySelector('[class*="_subtitle_"]')
                tracks.push(new Track({ title: htlm_title.textContent, artist: html_artist.textContent }))
            });
        } else {
            return error("No list found in the fetched HTML, perhaps spotify has updated their view?");
        }
        if (tracks.length < 1) {
            return error("Playlist contains no tracks");
        }
        return tracks
    }

    // Begin code
    const H_url = document.getElementById("H_url");
    const H_to_youtube = document.getElementById("H_to_youtube");
    const H_console = document.getElementById("H_console");
    const H_embedd = document.getElementById("H_embedd");

    const log = (...args) => {
        console.log(args)
        for (let i = 0; i < args.length; i++) {
            if (i > 0) {
                H_console.value += " "+String(args[i]);
            } else  {
                H_console.value += ""+String(args[i]);
            }
        }
        H_console.value += '\n';
        H_console.scrollTop = H_console.scrollHeight;
        return undefined
    }
    const error = (...args) => {
        return log("ERROR>", ...args)
    }

    const onUrlChanged = debounce(100, async () =>  {
        console.log("H_url", H_url.value)
        const extract_url = /\/playlist\/(.+)\?/;
        const match = H_url.value.match(extract_url);
        const spotify_url = match ? `https://open.spotify.com/embed/playlist/${match[1]}` : null;
        console.log("spotify_url", spotify_url)

        const spotifyWebcontents = await download_website(spotify_url)
        if (!(typeof spotifyWebcontents === "string")) {
            return error(`Failed to download ${spotify_url}`)
        }

        H_embedd.innerHTML = spotifyWebcontents
        const playlistTitle = await getTitleFromSpotifyEmbedd(H_embedd)
        const tracks = await getSongsFromSpotifyEmbedd(H_embedd)
        log("playlistTitle", playlistTitle)
        log("tracks", tracks)
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