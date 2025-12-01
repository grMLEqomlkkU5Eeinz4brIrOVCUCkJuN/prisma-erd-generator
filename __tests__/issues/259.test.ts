import * as child_process from 'node:child_process';
import { test, expect } from 'vitest';

test('ulid-support.prisma', async () => {
    const fileName = '259.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync('prisma generate --schema ./prisma/issues/259.prisma')
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)

    // Check that the generated SVG contains ULID type
    const svgContent = child_process.execSync(`cat ${folderName}/${fileName}`).toString()
    expect(svgContent).toContain('ULID')
})
