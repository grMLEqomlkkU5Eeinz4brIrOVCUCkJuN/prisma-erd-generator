import * as child_process from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test, expect } from 'vitest'

test('large-schema.prisma - Test file writing with massive schema', async () => {
    const fileName = 'large-schema.svg'
    const folderName = '__tests__'
    const debugDir = path.resolve('prisma/debug')
    
    // Clean up previous runs
    const svgPath = path.join(folderName, fileName)
    if (fs.existsSync(svgPath)) {
        fs.unlinkSync(svgPath)
    }
    if (fs.existsSync(debugDir)) {
        fs.rmSync(debugDir, { recursive: true, force: true })
    }
    
    // Generate the ERD with debug enabled
    child_process.execSync(
        'prisma generate --schema ./prisma/large-schema.prisma'
    )
    
    // Check that the SVG was generated
    expect(fs.existsSync(svgPath)).toBe(true)

    const svgAsString = fs.readFileSync(svgPath, 'utf8')

    // Verify SVG was generated
    expect(svgAsString).toContain('<svg')
    
    // Check that debug files were created
    const debugDataModelFile = path.join(debugDir, '1-datamodel.json')
    const debugMapAppliedFile = path.join(debugDir, '2-datamodel-map-applied.json')
    
    expect(fs.existsSync(debugDataModelFile)).toBe(true)
    expect(fs.existsSync(debugMapAppliedFile)).toBe(true)
    
    // Read and verify the debug JSON files are complete (not truncated)
    const dataModelContent = fs.readFileSync(debugDataModelFile, 'utf8')
    const mapAppliedContent = fs.readFileSync(debugMapAppliedFile, 'utf8')
    
    // Verify JSON is valid and complete (not truncated)
    expect(() => JSON.parse(dataModelContent)).not.toThrow()
    expect(() => JSON.parse(mapAppliedContent)).not.toThrow()
    
    // Verify the JSON files are substantial (large schema should produce large files)
    expect(dataModelContent.length).toBeGreaterThan(10000) // At least 10KB
    expect(mapAppliedContent.length).toBeGreaterThan(10000)
    
    // Verify the JSON files end properly (not truncated mid-object)
    expect(dataModelContent.trim().endsWith('}')).toBe(true)
    expect(mapAppliedContent.trim().endsWith('}')).toBe(true)
    
    // Verify models are present in the JSON
    const dataModelJson = JSON.parse(dataModelContent)
    expect(dataModelJson.models).toBeDefined()
    expect(Array.isArray(dataModelJson.models)).toBe(true)
    // We only need to ensure there are many models present, not an exact count.
    expect(dataModelJson.models.length).toBeGreaterThan(5)
    
    // Verify specific models are present
    const modelNames = dataModelJson.models.map((m: { name: string }) => m.name)
    expect(modelNames).toContain('User')
    expect(modelNames).toContain('Post')
    expect(modelNames).toContain('Model100')
    
    // Verify the SVG contains some of the models
    expect(svgAsString).toContain('User')
    expect(svgAsString).toContain('Post')
})

