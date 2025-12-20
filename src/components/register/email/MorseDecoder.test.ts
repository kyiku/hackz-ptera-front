/**
 * Issue #38: feat: メールアドレス入力 - 瞬きモールス信号UI
 *
 * テスト対象: MorseDecoder
 * - モールス信号のデコード
 * - 文字のエンコード
 */
import { describe, it, expect } from 'vitest'
import { MorseDecoder } from './MorseDecoder'

describe('MorseDecoder', () => {
    describe('decode', () => {
        it('モールス信号を文字に変換できる', () => {
            expect(MorseDecoder.decode('.-')).toBe('a')
            expect(MorseDecoder.decode('-...')).toBe('b')
            expect(MorseDecoder.decode('.')).toBe('e')
        })

        it('@記号を変換できる', () => {
            expect(MorseDecoder.decode('.--.-.')).toBe('@')
        })

        it('数字を変換できる', () => {
            expect(MorseDecoder.decode('.----')).toBe('1')
            expect(MorseDecoder.decode('-----')).toBe('0')
        })

        it('存在しないモールス信号は空文字を返す', () => {
            expect(MorseDecoder.decode('invalid')).toBe('')
        })
    })

    describe('decodeArray', () => {
        it('モールス信号の配列を文字列に変換できる', () => {
            const morse = ['....', '.', '.-..', '.-..', '---']
            expect(MorseDecoder.decodeArray(morse)).toBe('hello')
        })

        it('メールアドレスを変換できる', () => {
            const morse = ['-', '.', '...', '-', '.--.-.', '-', '.', '...', '-']
            expect(MorseDecoder.decodeArray(morse)).toBe('test@test')
        })
    })

    describe('encode', () => {
        it('文字をモールス信号に変換できる', () => {
            expect(MorseDecoder.encode('a')).toBe('.-')
            expect(MorseDecoder.encode('b')).toBe('-...')
            expect(MorseDecoder.encode('e')).toBe('.')
        })

        it('大文字も変換できる', () => {
            expect(MorseDecoder.encode('A')).toBe('.-')
            expect(MorseDecoder.encode('B')).toBe('-...')
        })

        it('@記号を変換できる', () => {
            expect(MorseDecoder.encode('@')).toBe('.--.-.')
        })

        it('存在しない文字は空文字を返す', () => {
            expect(MorseDecoder.encode('あ')).toBe('')
        })
    })

    describe('encodeArray', () => {
        it('文字列をモールス信号の配列に変換できる', () => {
            const result = MorseDecoder.encodeArray('hello')
            expect(result).toEqual(['....', '.', '.-..', '.-..', '---'])
        })

        it('メールアドレスを変換できる', () => {
            const result = MorseDecoder.encodeArray('test@test')
            expect(result).toEqual(['-', '.', '...', '-', '.--.-.', '-', '.', '...', '-'])
        })
    })

    describe('getMorseCodeMap', () => {
        it('モールス信号対応表を取得できる', () => {
            const map = MorseDecoder.getMorseCodeMap()
            expect(map['.-']).toBe('a')
            expect(map['.--.-.']).toBe('@')
            expect(Object.keys(map).length).toBeGreaterThan(0)
        })
    })
})
