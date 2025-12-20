/**
 * NameSlotPage - スロットで名前入力するページ
 */

import { SlotMachineApp } from '../components/slot/SlotMachineApp'

const NameSlotPage = () => {
    const handleNameChange = (name: string) => {
        // 名前をsessionStorageに保存（次のページで使用）
        sessionStorage.setItem('confirmedName', name)
    }

    return (
        <div
            data-testid="name-slot-page"
            className="min-h-screen bg-gray-50"
        >
            <SlotMachineApp onChange={handleNameChange} />
        </div>
    )
}

export default NameSlotPage
