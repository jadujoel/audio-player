import { useDispatch, useSelector } from 'react-redux'
import './AudioPlayer.css'
import { StoreState } from './store'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultCallback = (v: number): void => void 0

import { Player } from "player"
import { useEffect, useState } from 'react'
import { createAudioContext } from '../utils/audio-context'
import { ToggleButton } from './ToggleButton'
import { Knob } from './Knob'

export function zip<T1, T2> (a: Array<T1>, b: Array<T2>): Array<[T1, T2]> {
  a.length === b.length || console.error(`zip arrays of unequal length`)
  return a.map((v: T1, i: number): [T1, T2] => [ v, b[i] ])
}

function createPlayer () {
  return new Promise<Player>((resolve) => {
    createAudioContext()
    .then(ctx => resolve(new Player(ctx)))
  })
}

function getAudioUrl(id: string) {
  const audio = "/audio-player/audio/" as const
  return new URL(audio + id + ".mp4", window.location.href)
}

export async function getBuffer(url: URL, audioContext: AudioContext = new AudioContext()) {
  const data = await fetch(url)
  const arrayBuffer = await data.arrayBuffer()
  return audioContext.decodeAudioData(arrayBuffer)
}

async function initialize() {
  const files = ["kick", "pad"]
  const audioContext = await createAudioContext()
  const player = new Player(audioContext)
  const bufferPromises = files
    .map(getAudioUrl)
    .map(url => getBuffer(url, audioContext))
  const buffers = await Promise.all(bufferPromises)
  return {player, files, buffers, audioContext}
}

const initializePromise = initialize()

export function AudioPlayerComponent() {
  const state = useSelector<StoreState, StoreState['compressor']>(state => state.compressor)
  const dispatch = useDispatch()

  const [isReady, setReady] = useState(false)
  const [player, setPlayer] = useState<Player>()
  const [files, setFiles] = useState<string[]>([""])
  const [buffers, setBuffers] = useState<AudioBuffer[] | null[]>([null])
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null)
  const [file, setFile] = useState("")
  const [audioContext, setAudioContext] = useState<AudioContext>()
  const [loop, setLoop] = useState(false)
  const [gain, setGain] = useState(1)
  const [pan, setPan] = useState(0)
  const [detune, setDetune] = useState(0)

  useEffect(() => {
    initializePromise.then(({player, files, buffers, audioContext: ctx}) => {
      setAudioContext(ctx)
      console.warn({audioContexta: audioContext, ctx})
      player.connect(ctx.destination)
      setPlayer(player)
      setFiles(files)
      setBuffers(buffers)
      setReady(true)
    })
  }, [])

  return (
    <div className="AudioPlayer">
    <header className="header">AudioPlayer</header>
    { isReady
    ? (
      <div>
        <button className='play'
          type="button"
          onClick={() => {
            if (!player || !audioContext) {
              return
            }
            audioContext.resume()
            player.buffer = buffer
            player.play({gain, detune, pan, when: 0, loop})
          }}>
          Play
        </button>
        <button className="pause"
          type="button"
          onClick={() => {
            player?.pause()
          }}>
          Pause
        </button>
        <button className="resume"
          type="button"
          onClick={() => {
            player?.resume()
          }}>
          Resume
        </button>
        <button className="stop"
          type="button"
          onClick={() => {
            player?.stop()
          }}>
          Stop
        </button>
        <div>
          <ToggleButton onChange={() => setLoop(!loop)}/>
          <label>Loop</label>
        </div>
        <div className="audio-params">
          <div className="gain">
            <Knob
              onChange={(v) => {
                setGain(v)
                player!.gain = v
              }}
              value={gain}
              min={0}
              max={1}
            />
            <label>Gain</label>
          </div>
          <div className="pan">
            <Knob
              onChange={(v) => {
                setPan(v)
                player!.pan = v
              }}
              value={pan}
              min={-1}
              max={1}
            />
            <label>Pan</label>
          </div>
          <div className="detune">
            <Knob
              onChange={(v) => {
                console.log("set detune", v, player, player?.detune)
                setDetune(v)
                player!.detune = v
              }}
              value={detune}
              min={-4800}
              max={4800}
            />
            <label>Detune</label>
          </div>
        </div>
        <div className="files">
          {
            zip(files, buffers).map(
              ([fil, buf]) => (
                <button
                  key={fil}
                  type="button"
                  onClick={() => {
                    if(player) {
                      player.buffer = buf
                    }
                    console.log({fil, buf, player})
                    setBuffer(buf)
                    setFile(fil)
                  }}>
                  {fil}
                </button>
              )
            )
          }
        </div>
      </div>
      )
    : (
      <button type="button">Start</button>
    )
    }
    </div>
  )
}
