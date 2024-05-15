import {require} from "./lib/lib.mjs"
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

    const downloadWebsite = async (url) => {
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
            "Access-Control-Allow-Origin":"*",
        }
        const site = await
            fetch(url, {headers: headers})
            .then(response => response.text())
        //console.log("read site!", site)
        return site
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
            olElement.querySelectorAll('li').forEach(li => {
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

    const trackListToYtSearch = (tracklist, preSearch) => {
        const ytUrls = tracklist.map(track => {
            const escapeTerm = encodeURIComponent(`${preSearch} ${track.title}, ${track.artist}`);
            const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${escapeTerm}`
            return youtubeSearchUrl
        })

        return ytUrls
    }

    const re_extractVideoIdJsons = /{"videoRenderer":{"videoId":".*?}}}/g
    const parallellSearchYTForAndReturnVideoIds = async (ytUrls) => {
        const promises = ytUrls.map(async (ytUrl) => {
            const webResult = await downloadWebsite(ytUrl)
            let match
            for (match of webResult.matchAll(re_extractVideoIdJsons)) {
                const videoInfoStr = match[0] + "}}"
                //console.log(videoInfoStr);
                const videoInfo = JSON.parse(videoInfoStr)
                const id = videoInfo.videoRenderer.videoId
                const title = videoInfo.videoRenderer.title.runs[0].text
                console.log(`id=\"${id}\" title=\"${title}\"`)
                return id;
            }
        })
        return Promise.all(promises);
    }

    // Begin code
    const H_url = document.getElementById("H_url");
    const H_to_youtube = document.getElementById("H_to_youtube");
    const H_console = document.getElementById("H_console");
    const H_embedd = document.getElementById("H_embedd");

    const log = (...args) => {
        console.log(...args)
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

        const spotifyWebcontents = await downloadWebsite(spotify_url)
        if (!(typeof spotifyWebcontents === "string")) {
            return error(`Failed to download ${spotify_url}`)
        }

        H_embedd.innerHTML = spotifyWebcontents
        const playlistTitle = await getTitleFromSpotifyEmbedd(H_embedd)
        const tracks = await getSongsFromSpotifyEmbedd(H_embedd)
        H_embedd.innerHTML = ""

        log("playlistTitle", playlistTitle)
        log("tracks", tracks)
        if (playlistTitle === undefined || tracks.length === 0) {
            return
        }

        const ytSearchLinks = trackListToYtSearch(tracks, "Nightcore")
        log("ytSearchLinks", ytSearchLinks)

        const ytVideoIds = await parallellSearchYTForAndReturnVideoIds(ytSearchLinks)
        log("ytVideoIds", ytVideoIds)

        const popupUrlArgs = {};
        ytVideoIds.forEach((value, index) => {
            popupUrlArgs[index] = `https://www.youtube.com/watch?v=${value}`;
        });
        //browser.tabs.create({ url: `src/link_preview.html?${new URLSearchParams(popupUrlArgs).toString()}` });
        await browser.tabs.create({ url: popupUrlArgs[0]}).then(async newTab => {
            await browser.scripting.executeScript({
                target: { tabId: newTab.id },
                func: () => {
                    document.body.style.border = "5px solid green";
                    alert(args)
                },
                files: ["src/link_preview.js"],
            });
        })
        alert("don't leave me")
    })


    H_url.addEventListener("input", onUrlChanged);
    // default with current page
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        var url = tabs[0].url;

        //H_text.value = url
        H_url.value = "https://open.spotify.com/playlist/5fzmx31hsQDzbj6Pi57UFQ?si=qCjMDaZ-Th6ZHZ-THFE5OQ&pi=e-kJppvAyuQfWI";

        onUrlChanged()
    })
})