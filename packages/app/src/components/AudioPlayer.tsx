import { useDispatch, useSelector } from 'react-redux'
import './AudioPlayer.css'
import { StoreState } from './store'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultCallback = (v: number): void => void 0

import { Player, Sample } from "player"
import { useEffect, useId, useState } from 'react'
import { createAudioContext } from '../utils/audio-context'
import { ToggleButton } from './ToggleButton'
import { Knob } from './Knob'
import { Writeable } from '../utils/types'
import { precisionRound } from '../utils/precisionRound'

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

async function Loader() {
  const audioContext = await createAudioContext()
  const files = ["never", "kick", "pad"]
  const bufferPromises = files
    .map(getAudioUrl)
    .map(url => getBuffer(url, audioContext))
  const buffers = await Promise.all(bufferPromises)
  const bufferMap = new Map<string, AudioBuffer | null>()
  for (const [file, buffer] of zip(files, buffers)) {
    bufferMap.set(file, buffer)
  }
  return {
    get: (file: string) => bufferMap.get(file),
    files: () => files,
    buffers: () => buffers,
    map: () => bufferMap,
    audioContext: audioContext
  }
}

async function initialize() {
  const loader = await Loader()
  const player = new Player(loader.audioContext)
  return {player, loader}
}

const initializePromise = initialize()

export function AudioPlayerComponent() {
  // const state = useSelector<StoreState, StoreState['compressor']>(state => state.compressor)
  // const dispatch = useDispatch()

  const [isReady, setReady] = useState(false)
  const [player, setPlayer] = useState<Player>()
  const [files, setFiles] = useState<string[]>([""])
  const [buffers, setBuffers] = useState<Map<string, AudioBuffer | null>>(new Map())
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null)
  const [file, setFile] = useState("")
  const [audioContext, setAudioContext] = useState<AudioContext>()
  const [loop, setLoop] = useState(false)
  const [gain, setGain] = useState(1)
  const [pan, setPan] = useState(0)
  const [detune, setDetune] = useState(0)
  const [polyphony, setPolyphony] = useState(1)
  const [samplesPlaying, setSamplesPlaying] = useState<Sample[]>()
  const [samplesPaused, setSamplesPaused] = useState<Sample[]>()
  const [loopStart, setLoopStart] = useState(0)
  const [loopEnd, setLoopEnd] = useState(-1)
  const [offset, setOffset] = useState(0)
  const [duration, setDuration] = useState<number>(-1)
  const [playbackRate, setPlaybackRate] = useState<number>(1)

  const [foo, updateFoo] = useState(true)
  const updateState = () => {
    updateFoo(!foo)
  }

  useEffect(() => {
    initializePromise.then(({player, loader}) => {
      setPlayer(player)
      setAudioContext(loader.audioContext)
      setFiles(loader.files())
      setFile(loader.files()[0])
      setBuffers(loader.map())
      const buf = loader.buffers()[0]
      setBuffer(loader.buffers()[0])
      setReady(true)
      player.connect(loader.audioContext.destination)
      player.polyphony = polyphony
      player.buffer = buf
      player.gain = gain
      player.pan = pan
      player.detune = detune

      player.onplayCallbacks = player.onstopCallbacks = player.onpauseCallbacks = player.onresumeCallbacks = [() => {
        console.log(player.samplesPlaying.items)
        setSamplesPlaying([...player.samplesPlaying.items])
        setSamplesPaused([...player.samplesPaused.items])
        updateState()
      }]

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
            player.play({loop, loopStart, loopEnd, offset, duration, detune, gain, pan})
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
        <button className="pause-all"
          type="button"
          onClick={() => {
            player?.pauseAll()
          }}>
          Pause All
        </button>
        <button className="resume"
          type="button"
          onClick={() => {
            player?.resume()
          }}>
          Resume
        </button>
        <button className="resume-all"
          type="button"
          onClick={() => {
            player?.resumeAll()
          }}>
          Resume All
        </button>
        <button className="stop"
          type="button"
          onClick={() => {
            player?.stop()
          }}>
          Stop
        </button>
        <button className="stop-all"
          type="button"
          onClick={() => {
            player?.stopAll()
          }}>
          Stop All
        </button>


        <div className="play-options">
          <div className ="offset">
            <label>Offset</label>
            <input aria-label="offset" type="number"
                  onChange={(e) => setOffset(Number(e.target.value))}
                  defaultValue={offset}/>
          </div>
          <div className ="duration">
            <label>Duration</label>
            <input aria-label="offset" type="number"
                  min={-1}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  defaultValue={duration}/>
          </div>
          <div className='loop'>
            <div>
              <ToggleButton onChange={() => setLoop(!loop)}/>
              <label>On / Off</label>
            </div>
            <div>
              <label>Loop Start</label>
              <input aria-label="loop-start" type="number"
                min={0}
                onChange={(e) => setLoopStart(Number(e.target.value))}
                defaultValue={loopStart}/>
            </div>
            <div>
              <label>Loop End</label>
              <input aria-label="loop-end" type="number"
                min={0}
                max={player?.bufferTime}
                onChange={(e) => setLoopEnd(Number(e.target.value))}
                defaultValue={loopEnd}/>
            </div>
          </div>
        </div>

        <div className="audio-params">
          <div className="gain">
            <label>{precisionRound(gain, 2)}</label>
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
            <label>{precisionRound(pan, 2)}</label>
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
            <label>{precisionRound(detune, 0)}</label>
            <Knob
              onChange={(v) => {
                setDetune(v)
                player!.detune = v
              }}
              fillStart={Knob.FillStart.Middle}
              value={detune}
              min={-4800}
              max={4800}
            />
            <label>Detune</label>
          </div>
          <div className="playbackRate">
            <label>{precisionRound(playbackRate, 2)}</label>
            <Knob
              onChange={(v) => {
                setDetune(v)
                player!.playbackRate = v
              }}
              fillStart={Knob.FillStart.Middle}
              value={playbackRate}
              min={0}
              max={16}
            />
            <label>PlaybackRate</label>
          </div>
        </div>
        <div className='polyphony'>
          <label>Polyphony</label>
          <input
            aria-label='polyphony'
            type="number"
            min={0}
            max={99}
            defaultValue={polyphony}
            onInput={(e) => {
              const newPolyphony = Number(e.currentTarget.value)
              setPolyphony(newPolyphony)
              player!.polyphony = newPolyphony
            }}
            ></input>
        </div>
        {<div className="sample-list">
          <div className="playing">
            <label>Playing:</label>
            <ul>
              {
                samplesPlaying?.map(sample => {
                  const time = precisionRound(sample.playTime, 2)
                  return (
                    <li key={file + sample.id + sample.playTime}>{`${file}: {startTime: ${time}}`}</li>
                  )
                })
              }
            </ul>
          </div>
          <div className="pause">
            <label>Paused</label>
            <ul className="paused">
              {
                samplesPaused?.map(sample => {
                  const time = precisionRound(sample.pauseTime, 2)
                  return (
                    <li key={file + sample.id + sample.pauseTime}>{`${file}: {pauseTime: ${time}}`}</li>
                  )
                })
              }
            </ul>
          </div>
        </div>}
        <div className="files">
          <label>Audio:</label>
          <select title="file" onChange={(e) => {
            const newFile = e.currentTarget.value
            const buffer = buffers.get(newFile)
            if(!player || buffer === undefined) {
              return
            }
            player.buffer = buffer
            setBuffer(buffer)
            setFile(newFile)
          }}>
          {
            files.map(
              (fil) => (
                <option
                  key={fil}
                  value={fil}
                >{fil}
                </option>
              )
            )
          }
        </select>
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
