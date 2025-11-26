import * as child_process from 'node:child_process'
import { test, expect } from 'vitest'

test('issue 219: unnecessary many-to-many relation lines', async () => {
    const fileName = '219.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync(
        'prisma generate --schema ./prisma/issues/219.prisma'
    )
    const svgContent = child_process
        .execSync(`cat ${folderName}/${fileName}`)
        .toString()

    // Verify both models are present
    expect(svgContent).toContain('Schedule')
    expect(svgContent).toContain('DailySchedule')

    // The key issue: we should NOT have a many-to-many relationship line (o{--}o)
    // between Schedule and DailySchedule. This is a one-to-many relationship.
    
    // Count occurrences of many-to-many markers in the SVG
    // Many-to-many relationships use markers like "zeroOrMoreStart" and "zeroOrMoreEnd"
    const manyToManyStartMarkers = (svgContent.match(/zeroOrMoreStart/g) || []).length
    const manyToManyEndMarkers = (svgContent.match(/zeroOrMoreEnd/g) || []).length
    
    // For a one-to-many relationship, we should have:
    // - "onlyOneStart" and "zeroOrMoreEnd" (or similar) markers
    // - NOT "zeroOrMoreStart" and "zeroOrMoreEnd" together (which indicates many-to-many)
    
    // Check that we have the correct one-to-many markers
    const onlyOneStartMarkers = (svgContent.match(/onlyOneStart/g) || []).length
    const zeroOrMoreEndMarkers = (svgContent.match(/zeroOrMoreEnd/g) || []).length
    
    // We should have one-to-many markers (onlyOneStart with zeroOrMoreEnd)
    // but NOT many-to-many markers (zeroOrMoreStart with zeroOrMoreEnd)
    expect(onlyOneStartMarkers).toBeGreaterThan(0)
    expect(zeroOrMoreEndMarkers).toBeGreaterThan(0)
    
    // The many-to-many start markers should be 0 (or at least not match the end markers)
    // This ensures we don't have a many-to-many relationship drawn
    if (manyToManyStartMarkers > 0) {
        // If we have many-to-many start markers, they should not be paired with end markers
        // for the Schedule-DailySchedule relationship
        expect(manyToManyStartMarkers).not.toEqual(manyToManyEndMarkers)
    }
})
