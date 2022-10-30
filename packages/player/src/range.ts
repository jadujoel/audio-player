
export function range(max: number) {
    return [...Array(Math.max(max, 0)).keys()]
}

export function xrange(min: number, max: number) {
    return arrayAdd(range(min - max), min)
}

export function arrayAdd(X: number[], num: number) {
    return X.map(xn => xn + num)
}
