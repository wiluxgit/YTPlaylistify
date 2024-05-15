export class Track {
    constructor({title, artist}) {
        this.title = title;
        this.artist = artist;
    }
    toString() {
        return `${this.constructor.name}{${this.title} by ${this.artist}}`;
    }
}

/**
 * May only contain json types and kw args
 */
export class Message {
    constructor() {
        this.classConstructorName = ""+this.constructor.name
    }
}

export class MCreatePlaylist extends Message {
    constructor({injectionSite, urls}) {
        super()
        this.injectionSite = injectionSite
        this.urls = urls
    }
}

export class MDebug extends Message {
    constructor({message}) {
        super()
        this.message = message
    }
}

const messageTypes = [MCreatePlaylist, MDebug]

/**
 *
 * @param {Message} obj
 * @returns {Message}
 */
export function reinstanceMessageFromJson(obj) {
    for (const messageType of messageTypes) {
        if (obj.classConstructorName === messageType.name) {
            return new messageType(obj)
        }
    }
    console.error("Found no messaage type in:", obj)
    throw TypeError(`Found no messaage of type: \"${obj.classConstructorName}\" in ${obj}`)
}