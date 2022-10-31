export interface AutomateOptions<T extends string> {
    /** Id of the parameter to modify, for example: pan, pitch, gain */
    paramId: T;
    /** A value curve that will be applied to the AudioParam */
    valueCurve: number[] | Float32Array | readonly number[] | Float32Array;
    /** When the curve should start in consideration to AudioContext timer */
    when: number;
    /** How long it should take to reach the last value */
    duration: number;
}
export declare type AutomatableParameters<T> = T extends Automatable<infer U> ? U extends readonly string[] ? U : never : never;
export interface Automatable<T extends readonly string[]> {
    automator: Automator<T>;
}
export declare class AutomatorError extends Error {
    name: string;
    constructor(message?: string);
}
export declare class Automator<T extends readonly string[]> {
    #private;
    AutomatableParameters: T;
    constructor(automatableParameters: T);
    automate({ paramId, valueCurve, when, duration }: AutomateOptions<T[number]>): void;
    add(paramId: T[number], audioParam: AudioParam, defaultValue?: number): void;
    /** When you don't want to add a new param just update an existing one */
    set(paramId: T[number], audioParam: AudioParam, defaultValue?: number): void;
    /** Cancel any planned values */
    cancel({ paramId, when }: {
        paramId: T[number];
        when: number;
    }): void;
    get(param: T[number]): AudioParam;
    /** Get the current value of the parameter */
    current(param: T[number]): number;
    /** get the default value of said parameter */
    getDefault(param: T[number]): number;
    setDefault(param: T[number], value: number): void;
    dispose(): void;
}
//# sourceMappingURL=ecas-automator.d.ts.map