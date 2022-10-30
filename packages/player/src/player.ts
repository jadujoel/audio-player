import { max } from "./clamp"
import { Queue } from "./queue"
import { range, xrange } from "./range"
import { Sample } from "./sample"
import type { PlayOptions, StopOptions } from "./types"

export class Player {
    #audioContext: AudioContext
    #pan: StereoPannerNode
    #gain: GainNode
    counter = 0
    samplesPlaying = new Queue<Sample>()
    samplesPaused = new Queue<Sample>()
    #crossfadeTime = 0.02
    polyphony = 2
    #buffer: AudioBuffer | null

    constructor(audioContext: AudioContext, buffer: AudioBuffer | null = null) {
        this.#buffer = buffer
        this.#audioContext = audioContext
        this.#pan = this.#audioContext.createStereoPanner()
        this.#gain = this.#audioContext.createGain()
        this.#pan.connect(this.#gain)
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
        console.debug('[player]: detune', newDetune)
        for (const sample of this.samples) {
            sample.detune = newDetune
        }
    }

    get detune() {
        return this.samples[0].detune || 0
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

    play(options: PlayOptions = {}) {
        const sample = new Sample(this.#audioContext)
        sample.buffer = this.#buffer
        sample.connect(this.#pan)

        sample.onstarted = () => {
            console.debug("[player]: started")
            this.samplesPlaying.enqueue(sample)
            if (this.samplesPlaying.length > this.polyphony) {
                console.debug("[player]: polyphony clamp")
                this.stop({fadeOut: this.crossfadeTime})
            }
        }

        // make sure we dequeue the sample when it finishes even if it's not stopped manually
        sample.onended = () => this.#onended()

        console.debug("[player]: playing:", this.samplesPlaying.length, "paused:", this.samplesPaused.length)
        return sample.play(options)
    }

    pause(options = {when: 0, fadeOut: 0}) {
        const sample = this.samplesPlaying.dequeue()
        if (!sample) {
            return Promise.resolve(this.now)
        }
        this.samplesPaused.enqueue(sample)
        return sample.pause(options)
    }

    stop({when, fadeOut}: StopOptions = {}) {
        const then = max(this.now, when || 0)
        const sample = this.samplesPlaying.dequeue()
        if (!sample) {
            return Promise.resolve(this.now)
        }
        // since sample was manually stop don't run the onended stop thing
        sample.onended = () => void 0
        return sample.stop({when: then, fadeOut: fadeOut || 0.2})
    }

    resume(options = {when: 0, fadeIn: 0}) {
        const sample = this.samplesPaused.dequeue()
        if (!sample) {
            return [
                Promise.resolve(this.now),
                Promise.resolve(this.now)
            ] as const
        }
        this.samplesPlaying.enqueue(sample)
        return sample.resume(options)
    }

    pauseAll(options = {when: 0, fadeOut: 0}) {
        return Promise.all(
            range(this.samplesPlaying.length)
                .map(() => this.pause(options))
        )
    }

    resumeAll(options = {when: 0, fadeIn: 0}) {
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
        for (const i of xrange(n, n + m)) {
            promises[i] = this.stopPaused(options)
        }
        return Promise.all(promises)
    }

    /** Stop one sample that is paused */
    stopPaused(options: StopOptions = {}) {
        const sample = this.samplesPaused.dequeue()
        return sample
            ? sample.stop(options)
            : Promise.resolve(this.now)
    }

    /** Stops the first sample in the queue */
    #onended() {
        console.debug("[player]: onended")
        const sample = this.samplesPlaying.dequeue()
        return sample
            ? sample.stop()
            : Promise.resolve(this.now)
    }
}
