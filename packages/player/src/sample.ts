import { max } from "./clamp"
import type { FunctionAny, PlayOptions, SampleOptions, StopOptions } from "./types"

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

    buffer: AudioBuffer | null = null
    isPlaying = false
    // if you want to do something very special when the sourceNodeEnd
    onended: FunctionAny = () => void 0
    onstarted: FunctionAny = () => void 0

    constructor(audioContext: AudioContext) {
        this.#audioContext = audioContext
        this.#sourceNode = this.#audioContext.createBufferSource()
        this.#pan = this.#audioContext.createStereoPanner()
        this.#gain = this.#audioContext.createGain()
        this.#pan.connect(this.#gain)
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
            console.debug("[sample]: tried to play already playing")
            return [Promise.resolve(this.now), Promise.resolve(this.now)] as const
        }
        this.isPlaying = true

        const required: SampleOptions = { ...this.#options, ...options }

        // store for later if we pause, resume etc
        this.#options = required

        const { detune, duration, loop, loopEnd, loopStart, when, offset, gain, pan } = required
        // don't try to schedule to the past
        const then = max(when, this.now)

        /////// gain
        this.#gain.gain.value = gain
        /////// fade

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

        this.#sourceNode.connect(this.#pan)
        this.#sourceNode.start(then, offset, duration)

        const playPromise = this.#createPlayPromise(then)
        playPromise.then(() => {
            this.#sourceNode.dispatchEvent(new Event("started"))
        })

        // for being able to pause / resume later
        this.#playTime = max(this.now, then)
        this.#playOffset = offset
        this.#playOptions = options

        return [playPromise, this.#createEndedPromise()] as const
    }

    pause({when} = {when: 0}): Promise<number> {
        if (!this.isPlaying) {
            console.debug("[sample]: tried to pause sample that is not playing")
            return Promise.resolve(this.now)
        }
        this.#pauseTime = this.now
        this.#pauseGain = this.#gain.gain.value
        const ret = this.#createEndedPromise()
        this.#sourceNode.stop(when)
        return ret
    }

    resume({when} = {when: 0}): readonly [Promise<number>, Promise<number>] {
        if (this.isPlaying) {
            console.debug("[sample]: tried to resume sample that is already playing")
            return [Promise.resolve(this.now), Promise.resolve(this.now)]
        }
        const offset = this.#playOffset || 0 + this.#pauseTime - this.#playTime
        return this.play({...this.#playOptions, offset, when, gain: this.#pauseGain})
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
        const safety = 0.5 as const // wont't sound smooth sometimes otherwise...
        this.#sourceNode.stop(then + fadeOut + safety)
        return this.#createEndedPromise()
    }

    get now() {
        return this.#audioContext.currentTime
    }

    get detune() {
        // detune is added to automator after sourcenode has been created
        return this.#options.detune
    }

    set detune(newDetune: number) {
        // detune is added to automator after sourcenode has been created
        this.#options.detune = newDetune
        console.log('[detune]')
        if (this.isPlaying) {
            console.log('[isPLaying]')
            this.#sourceNode.detune.value = newDetune
        }
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
