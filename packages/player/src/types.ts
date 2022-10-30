export interface PlayOptions {
    detune?: number
    loop?: boolean
    loopEnd?: number
    loopStart?: number
    gain?: number
    pan?: number
    offset?: number,
    duration?: number,
    when?: number,
}

export interface StopOptions {
    when?: number
    fadeOut?: number
}

export type FunctionAny = (...args: any[]) => any;

export type SampleOptions = Required<Omit<PlayOptions, "duration">> & { duration: number | undefined }
