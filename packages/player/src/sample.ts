import { max } from "./clamp"
import type { FunctionAny, PlayOptions, SampleOptions, StopOptions } from "./types"
// import { Automator } from "automator"
export class Sample {
    #audioContext: AudioContext
    #sourceNode: AudioBufferSourceNode
    #options: SampleOptions = {
        detune: 0,
        loop: false,
        loopStart: 0,
        loopEnd: -1,
        gain: 1,
        pan: 0,
        when: 0,
        offset: 0,
        duration: void 0,
    }
    #pan: StereoPannerNode
    #gain: GainNode
    // store when the sample was started so we can use that to pause / resume
    #playTime = 0
    #playOffset = 0
    #pauseTime = 0
    #pauseGain = 0

    #playOptions: PlayOptions = {}
    #bufferTime = Number.MAX_SAFE_INTEGER

    #buffer: AudioBuffer | null = null
    isPlaying = false
    // if you want to do something very special when the sourceNodeEnd
    onended: FunctionAny = () => void 0
    onstarted: FunctionAny = () => void 0
    id = 0

    // automator = new Automator(["gain", "pan", "detune", "playbackRate"] as const)

    constructor(audioContext: AudioContext, id: number) {
        this.id = id
        this.#audioContext = audioContext
        this.#sourceNode = this.#audioContext.createBufferSource()
        this.#pan = this.#audioContext.createStereoPanner()
        this.#gain = this.#audioContext.createGain()
        this.#pan.connect(this.#gain)
        // this.automator.add("gain", this.#gain.gain)
        // this.automator.add("pan", this.#pan.pan)
        // this.automator.add("detune", this.#sourceNode.detune)
        // this.automator.add("playbackRate", this.#sourceNode.playbackRate)
    }

    set buffer(newBuffer: AudioBuffer | null) {
        console.debug('[sample]: set buffer')
        this.#buffer = newBuffer
        if (newBuffer) {
            this.#bufferTime = newBuffer.length * this.#audioContext.sampleRate
        }
    }

    get buffer() {
        return this.#buffer
    }

    async dispose() {
        await this.stop()
        this.#sourceNode.disconnect()
        this.#pan.disconnect()
        this.#gain.disconnect()
        this.buffer = null
    }

    get output() {
        return this.#gain
    }

    connect(destinationNode: AudioNode) {
        return this.output.connect(destinationNode)
    }

    disconnect() {
        this.#sourceNode.disconnect()
        this.#pan.disconnect()
        this.#gain.disconnect()
    }

    /** Returns two promises, one When the Playback Starts, the other when it ends */
    play(options: PlayOptions = {}): readonly [Promise<number>, Promise<number>] {
        if (this.isPlaying) {
            console.debug("[sample]: tried to play already playing sample")
            return [Promise.resolve(this.now), Promise.resolve(this.now)] as const
        }
        if (!this.buffer) {
            console.debug("[sample]: sample has no buffer set")
            return [Promise.resolve(this.now), Promise.resolve(this.now)] as const
        }

        this.isPlaying = true

        // store for later if we pause, resume etc
        this.#options = { ...this.#options, ...options }

        const { detune, duration, loop, loopEnd, loopStart, when, offset, gain, pan } = this.#options
        console.debug('[sample]: play options', this.#options)

        // don't try to schedule to the past
        const then = max(when, this.now)

        this.#gain.gain.value = gain
        this.#pan.pan.value = pan

        this.#sourceNode = this.#audioContext.createBufferSource()
        this.#sourceNode.detune.value = detune
        this.#sourceNode.loop = loop
        this.#sourceNode.loopEnd = loopEnd
        this.#sourceNode.loopStart = loopStart
        this.#sourceNode.buffer = this.buffer
        this.#sourceNode.addEventListener("started", (ev) => {
            console.debug("[sample]: started")
            this.onstarted(ev)
        })
        this.#sourceNode.addEventListener("ended", (ev) => {
            // users callback, defaults to noop
            this.onended(ev)
            // then the node has ended, then we are not playing...
            this.isPlaying = false
        })

        // for being able to pause / resume later
        this.#playOffset = offset % this.#bufferTime
        this.#playTime = max(this.now, then)
        this.#playOptions = options

        this.#sourceNode.connect(this.#pan)
        this.#sourceNode.start(then, this.#playOffset, duration === -1 ? void 0 : duration)

        const playPromise = this.#createPlayPromise(then)
        playPromise.then(() => {
            this.#sourceNode.dispatchEvent(new Event("started"))
        })

        return [playPromise, this.#createEndedPromise()] as const
    }

    /** Get the time the sample started playing */
    get playTime() {
        return this.#playTime
    }

    get pauseTime() {
        return this.#pauseTime
    }

    pause({when} = {when: 0}): Promise<number> {
        console.debug('[sample]: pause')
        if (!this.isPlaying) {
            console.debug("[sample]: tried to pause sample that is not playing")
            return Promise.resolve(this.now)
        }
        this.#pauseTime = max(when, this.now)
        this.#pauseGain = this.#gain.gain.value // usefull if fadeout on pause

        this.#sourceNode.stop(this.#pauseTime)
        this.isPlaying = false
        return this.#createEndedPromise()
    }

    resume({when} = {when: 0}): readonly [Promise<number>, Promise<number>] {
        console.debug('[sample]: resume')
        if (this.isPlaying) {
            console.debug("[sample]: tried to resume sample that is already playing")
            return [Promise.resolve(this.now), Promise.resolve(this.now)]
        }
        /* FIXME: bug doesnt take into account detune
            https://github.com/WebAudio/web-audio-api/issues/2397#issuecomment-139273267
            https://github.com/WebAudio/web-audio-api/issues/2397#issuecomment-1193254844
        **/
        const offset = this.#playOffset + this.#pauseTime - this.#playTime
        const then = max(this.now, when)
        console.warn('[sample]: resume: playoptions', this.#playOptions)
        console.warn({offset, playOffset: this.#playOffset, pauseTime: this.#pauseTime, playTime: this.#playTime})
        return this.play({
            ...this.#playOptions,
            offset,
            when: then,
            gain: this.#pauseGain,
        })
    }

    stop(options: StopOptions = {}) {
        console.debug("[sample]: stop")
        if (!this.#sourceNode || !this.isPlaying) {
            console.debug("[sample]: tried to stop sound that is not playing")
            return Promise.resolve(this.now)
        }

        const defaultOptions: Required<StopOptions> = { when: 0, fadeOut: 0 } as const
        const roptions: Required<StopOptions> = { ...defaultOptions, ...options }
        const {when, fadeOut} = roptions
        const then = max(when, this.now)
        const safety = fadeOut ? 0.5 : 0 // wont't sound smooth sometimes otherwise...
        this.#sourceNode.stop(then + fadeOut + safety)
        return this.#createEndedPromise()
    }

    get now() {
        return this.#audioContext.currentTime
    }

    get detune() {
        // detune is added to automator after sourcenode has been created
        return this.#sourceNode.detune.value
    }

    set detune(newDetune: number) {
        this.#options.detune = newDetune
        this.#sourceNode.detune.value = newDetune
    }

    set playbackRate(newPlaybackRate: number) {
        this.#sourceNode.playbackRate.value = newPlaybackRate
    }

    get playbackRate() {
        return this.#sourceNode.playbackRate.value
    }

    #createEndedPromise() {
        return new Promise<number>((resolve) => {
            this.#sourceNode.addEventListener("ended", () => resolve(this.now), { once: true })
        })
    }

    #createPlayPromise(when: number) {
        // resolves when the playback starts and ends
        const now = this.now
        const then = max(when, now) - now
        const timeout = then * 1000
        return new Promise<number>((resolve) => {
            setTimeout(() => resolve(this.now), timeout)
        })
    }
}
