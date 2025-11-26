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
    
    // For a one-to-many relationship, we should have:
    // - "onlyOneStart" and "zeroOrMoreEnd" (or "oneOrMoreEnd") markers
    // - NOT "zeroOrMoreStart" and "zeroOrMoreEnd" together (which indicates many-to-many)
    
    // Check that we have the correct one-to-many markers
    const onlyOneStartMarkers = (svgContent.match(/onlyOneStart/g) || []).length
    const zeroOrMoreEndMarkers = (svgContent.match(/zeroOrMoreEnd/g) || []).length
    const oneOrMoreEndMarkers = (svgContent.match(/oneOrMoreEnd/g) || []).length
    
    // We should have one-to-many markers (onlyOneStart with zeroOrMoreEnd or oneOrMoreEnd)
    expect(onlyOneStartMarkers).toBeGreaterThan(0)
    expect(zeroOrMoreEndMarkers + oneOrMoreEndMarkers).toBeGreaterThan(0)
    
    // We should NOT have many-to-many markers (zeroOrMoreStart with zeroOrMoreEnd)
    // Count many-to-many start markers - should be 0 for this simple schema
    const manyToManyStartMarkers = (svgContent.match(/zeroOrMoreStart/g) || []).length
    // For this simple schema with only one relationship, there should be no many-to-many markers
    expect(manyToManyStartMarkers).toBe(0)
})
