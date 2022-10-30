import { Player } from "../../src"
import { getBuffer } from "../constants/buffer"

context("compressor", async () => {
    const music = "/pad.wav"
    const kick = "/kick.wav"
    const audioContext = new AudioContext()
    const now = () => audioContext.currentTime
    let buffer: AudioBuffer
    let buffer2: AudioBuffer

    beforeEach(async () => {
        buffer = await getBuffer(music)
        buffer2 = await getBuffer(kick)
    })

    it("starts test", async () => {
        const player = new Player(audioContext)
        player.buffer = buffer
        player.connect(audioContext.destination)
        player.play()
    })

})
