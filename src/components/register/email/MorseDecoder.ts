/**
 * MorseDecoder - モールス信号デコーダー
 * Issue #38: メールアドレス入力 - 瞬きモールス信号UI
 * 
 * 機能:
 * - モールス信号を文字に変換
 * - 国際モールス信号規格に準拠
 */

// モールス信号対応表
const MORSE_CODE_MAP: Record<string, string> = {
    '.-': 'a',
    '-...': 'b',
    '-.-.': 'c',
    '-..': 'd',
    '.': 'e',
    '..-.': 'f',
    '--.': 'g',
    '....': 'h',
    '..': 'i',
    '.---': 'j',
    '-.-': 'k',
    '.-..': 'l',
    '--': 'm',
    '-.': 'n',
    '---': 'o',
    '.--.': 'p',
    '--.-': 'q',
    '.-.': 'r',
    '...': 's',
    '-': 't',
    '..-': 'u',
    '...-': 'v',
    '.--': 'w',
    '-..-': 'x',
    '-.--': 'y',
    '--..': 'z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',
    '-----': '0',
    '.-.-.-': '.',
    '--..--': ',',
    '..--..': '?',
    '.----.': "'",
    '-.-.--': '!',
    '-..-.': '/',
    '-.--.': '(',
    '-.--.-': ')',
    '.-...': '&',
    '---...': ':',
    '-.-.-.': ';',
    '-...-': '=',
    '.-.-.': '+',
    '-....-': '-',
    '..--.-': '_',
    '.-..-.': '"',
    '...-..-': '$',
    '.--.-.': '@',
}

export class MorseDecoder {
    /**
     * モールス信号を文字に変換
     * @param morse モールス信号（例: ".-"）
     * @returns 変換された文字（見つからない場合は空文字）
     */
    static decode(morse: string): string {
        return MORSE_CODE_MAP[morse] || ''
    }

    /**
     * モールス信号の配列を文字列に変換
     * @param morseArray モールス信号の配列（例: [".-", "-..."]）
     * @returns 変換された文字列
     */
    static decodeArray(morseArray: string[]): string {
        return morseArray.map((morse) => this.decode(morse)).join('')
    }

    /**
     * 文字をモールス信号に変換
     * @param char 文字
     * @returns モールス信号（見つからない場合は空文字）
     */
    static encode(char: string): string {
        const lowerChar = char.toLowerCase()
        const entry = Object.entries(MORSE_CODE_MAP).find(
            ([, value]) => value === lowerChar
        )
        return entry ? entry[0] : ''
    }

    /**
     * 文字列をモールス信号の配列に変換
     * @param text 文字列
     * @returns モールス信号の配列
     */
    static encodeArray(text: string): string[] {
        return text.split('').map((char) => this.encode(char))
    }

    /**
     * モールス信号対応表を取得
     * @returns モールス信号対応表
     */
    static getMorseCodeMap(): Record<string, string> {
        return { ...MORSE_CODE_MAP }
    }
}

export default MorseDecoder
