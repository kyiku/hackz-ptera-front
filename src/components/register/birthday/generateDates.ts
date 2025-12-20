/**
 * 日付を生成（1年1月1日 〜 2025年12月21日）
 * 閏年は考慮しない（2月は常に28日まで）
 * 
 * 注意: 約73万個の日付を生成するため、メモリ使用量に注意
 */
export function generateDates(): string[] {
    const dates: string[] = []
    const startYear = 1
    const endYear = 2025
    const endMonth = 12
    const endDay = 21

    // 各月の日数（閏年を考慮しない）
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    for (let year = startYear; year <= endYear; year++) {
        const maxMonth = year === endYear ? endMonth : 12
        for (let month = 1; month <= maxMonth; month++) {
            const maxDay = year === endYear && month === endMonth ? endDay : daysInMonth[month - 1]
            for (let day = 1; day <= maxDay; day++) {
                dates.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)
            }
        }
    }

    return dates
}

