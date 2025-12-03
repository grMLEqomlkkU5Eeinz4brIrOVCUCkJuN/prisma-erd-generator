import * as child_process from 'node:child_process';
import { test, expect } from 'vitest';

test('uuid-support.prisma', async () => {
    const fileName = '260.svg'
    const folderName = '__tests__'
    child_process.execSync(`rm -f ${folderName}/${fileName}`)
    child_process.execSync('prisma generate --schema ./prisma/issues/260.prisma')
    const listFile = child_process.execSync(`ls -la ${folderName}/${fileName}`)
    // did it generate a file
    expect(listFile.toString()).toContain(fileName)

    // Check that the generated SVG contains UUID type
    const svgContent = child_process.execSync(`cat ${folderName}/${fileName}`).toString()
    expect(svgContent).toContain('UUID')
})