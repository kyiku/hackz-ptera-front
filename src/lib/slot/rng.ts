/**
 * rng.ts - 乱数生成ユーティリティ
 * テストで差し替えできるように分離
 */

/**
 * 0以上max未満の整数の乱数を生成
 */
export function randomInt(max: number): number {
    return Math.floor(Math.random() * max)
}

/**
 * min以上max未満の整数の乱数を生成
 */
export function randomIntBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min
}

/**
 * 配列からランダムに要素を選択
 */
export function randomChoice<T>(array: readonly T[]): T {
    return array[randomInt(array.length)]
}

