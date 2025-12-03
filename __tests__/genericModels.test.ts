import * as fs from 'node:fs';
import { test, expect } from 'vitest';
import * as child_process from 'node:child_process';


test('schema.prisma', async () => {
    if (fs.existsSync('ERD.svg')) {
        fs.unlinkSync('ERD.svg');
    }
    child_process.execSync('prisma generate');
    // did it generate a file
    expect(fs.existsSync('ERD.svg')).toBe(true);

    const svgAsString = await fs.promises.readFile('ERD.svg', 'utf-8');
    // did it generate a file with the correct content
    expect(svgAsString).toContain('<svg');
    expect(svgAsString).toContain('DefaultCalendar');
    expect(svgAsString).toContain('users');
    expect(svgAsString).toContain('Session');
    expect(svgAsString).toContain('ConnectedCalendar');
    expect(svgAsString).toContain('DailySchedule');
    expect(svgAsString).toContain('Schedule');
    expect(svgAsString).toContain('Booking');
});
