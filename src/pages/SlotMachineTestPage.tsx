/**
 * SlotMachineTestPage - スロットマシンテストページ（デザイン確認用）
 * 認証不要でスロットマシンのデザインを確認できる
 */

import { useState } from 'react'
import { SlotMachineInput } from '../components/register/name/SlotMachineInput'

const SlotMachineTestPage = () => {
    const [name, setName] = useState('')

    return (
        <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">スロットマシンUI（テストページ）</h1>
                <p className="text-center text-gray-400 mb-8">
                    デザイン確認用のページです。認証不要でアクセスできます。
                </p>

                {/* スロットマシン */}
                <SlotMachineInput
                    value={name}
                    onChange={setName}
                    maxLength={3}
                />

                {/* 入力された名前の表示（デバッグ用） */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400">入力された名前: <span className="text-white font-bold">{name || '（未入力）'}</span></p>
                </div>
            </div>
        </div>
    )
}

export default SlotMachineTestPage

