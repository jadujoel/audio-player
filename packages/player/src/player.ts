import { max } from "./clamp"
import { Queue } from "./queue"
import { range, xrange } from "./range"
import { Sample } from "./sample"
import type { FunctionAny, PlayOptions, StopOptions } from "./types"

export class Player {
    #audioContext: AudioContext
    #pan: StereoPannerNode
    #gain: GainNode
    counter = 0
    samplesPlaying = new Queue<Sample>()
    samplesPaused = new Queue<Sample>()
    #crossfadeTime = 0.02
    #polyphony = 2
    #buffer: AudioBuffer | null

    onplayCallbacks: FunctionAny[] = []
    onpauseCallbacks: FunctionAny[] = []
    onresumeCallbacks: FunctionAny[] = []
    onstopCallbacks: FunctionAny[] = []

    constructor(audioContext: AudioContext, buffer: AudioBuffer | null = null) {
        this.#buffer = buffer
        this.#audioContext = audioContext
        this.#pan = this.#audioContext.createStereoPanner()
        this.#gain = this.#audioContext.createGain()
        this.#pan.connect(this.#gain)
    }

    get bufferTime() {
        return (this.buffer?.length || 0) * this.#audioContext.sampleRate
    }

    set polyphony(newPolyphony: number) {
        console.debug('[player]: set polyphony', newPolyphony)
        this.#polyphony = newPolyphony
        this.#clampPolyphony()
    }

    get polyphony() {
        return this.#polyphony
    }

    set buffer(newBuffer: AudioBuffer | null) {
        console.debug("[player]: buffer", newBuffer)
        this.#buffer = newBuffer
    }

    get buffer() {
        return this.#buffer
    }

    async dispose () {
        console.debug("[player]: dispose")
        await this.stopAll()
        this.samplesPlaying.clear()
        this.samplesPaused.clear()
    }

    get output() {
        return this.#gain
    }

    get now() {
        return this.#audioContext.currentTime
    }

    get gain() {
        return this.#gain.gain.value
    }

    set gain(newGain: number) {
        this.#gain.gain.value = newGain
    }

    get pan() {
        return this.#pan.pan.value
    }

    set pan(newPan: number) {
        this.#pan.pan.value = newPan
    }

    set detune(newDetune: number) {
        for (const sample of this.samples) {
            sample.detune = newDetune
        }
    }

    get detune() {
        const firstSample = this.samples[0]
        return firstSample ? firstSample.detune : 0
    }

    get samples() {
        return [...this.samplesPlaying.items, ...this.samplesPaused.items]
    }

    set crossfadeTime(time: number) {
        if (time < 0) {
            console.warn("[player]: tried to set crossfadeTime less than 0, clamping value.")
        }
        this.#crossfadeTime = max(time, 0)
    }

    get crossfadeTime() {
        return this.#crossfadeTime
    }

    connect(destinationNode: AudioNode): AudioNode {
        return this.output.connect(destinationNode)
    }

    disconnect() {
        this.#pan.disconnect()
        this.#gain.disconnect()
    }

    triggerOnplay() {
        console.debug('[player]: trigger onplay')
        for (const cb of this.onplayCallbacks) {
            cb()
        }
    }

    triggerOnstop() {
        for (const cb of this.onstopCallbacks) {
            cb()
        }
    }

    triggerOnpause() {
        for (const cb of this.onpauseCallbacks) {
            cb()
        }
    }

    triggerOnresume() {
        for (const cb of this.onresumeCallbacks) {
            cb()
        }
    }

    play(options: PlayOptions = {}) {
        console.debug('[player]: play')
        const sample = new Sample(this.#audioContext, this.samplesPlaying.length)
        sample.buffer = this.#buffer
        sample.connect(this.#pan)

        sample.onstarted = () => {
            this.samplesPlaying.enqueue(sample)
            this.#clampPolyphony()
            this.triggerOnplay()
        }

        // make sure we dequeue the sample when it finishes even if it's not stopped manually
        sample.onended = () => this.#onended()

        console.debug("[player]: playing:", this.samplesPlaying.length, "paused:", this.samplesPaused.length)
        const ret = sample.play(options)
        return ret
    }

    pause(options = {when: 0, fadeOut: 0}) {
        console.debug('[player]: pause')
        const sample = this.samplesPlaying.dequeue()
        if (!sample) {
            return Promise.resolve(this.now)
        }
        this.samplesPaused.enqueue(sample)
        sample.onended = () => void 0
        const ret = sample.pause(options)
        ret.then(() => this.triggerOnpause())
        return ret
    }

    stop({when, fadeOut}: StopOptions = {}) {
        console.debug('[player]: stop')
        const then = max(this.now, when || 0)
        const sample = this.samplesPlaying.dequeue()
        if (!sample) {
            return Promise.resolve(this.now)
        }
        // since sample was manually stop don't run the onended stop thing
        sample.onended = () => void 0
        const ret = sample.stop({when: then, fadeOut: fadeOut || 0.2})
        ret.then(() => this.triggerOnstop())
        return ret
    }

    resume(options = {when: 0, fadeIn: 0}) {
        console.debug('[player]: resume')
        const sample = this.samplesPaused.dequeue()
        if (!sample) {
            return [
                Promise.resolve(this.now),
                Promise.resolve(this.now)
            ] as const
        }
        // make sure we dequeue the sample when it finishes even if it's not stopped manually
        sample.onended = () => this.#onended()
        // this.samplesPlaying.enqueue(sample)
        this.#clampPolyphony()
        const ret = sample.resume(options)
        ret[0].then(() => this.triggerOnresume())
        return ret
    }

    #clampPolyphony() {
        while (this.samplesPlaying.length > this.polyphony) {
            console.debug("[player]: polyphony clamp")
            this.stop({fadeOut: this.crossfadeTime})
        }
    }

    pauseAll(options = {when: this.now + 0.5, fadeOut: 0}) {
        return Promise.all(
            range(this.samplesPlaying.length)
                .map(() => this.pause(options))
        )
    }

    resumeAll(options = {when: this.now + 0.5, fadeIn: 0}) {
        return Promise.all(
            range(this.samplesPaused.length)
                .map(() => this.resume(options))
        )
    }

    stopAll(options: StopOptions = {}) {
        const n = this.samplesPlaying.length
        const m = this.samplesPaused.length
        const promises = new Array<Promise<number>>(n + m)
        for (const i of range(n)) {
            promises[i] = this.stop(options)
        }
        for (const i of range(m)) {
            promises[i + n] = this.stopPaused(options)
        }
        return Promise.all(promises)
    }

    /** Stop one sample that is paused */
    stopPaused(options: StopOptions = {}) {
        const sample = this.samplesPaused.dequeue()
        const ret = sample
            ? sample.stop(options)
            : Promise.resolve(this.now)
        ret.then(() => this.triggerOnstop())
        return ret
    }

    /** Stops the first sample in the queue */
    #onended() {
        console.debug("[player]: onended")
        const sample = this.samplesPlaying.dequeue()
        const ret = sample
            ? sample.stop()
            : Promise.resolve(this.now)
        ret.then(() => {
            this.triggerOnstop()
            console.log("[player]: triggerOnstop")
        })
        return ret
    }
}
