import fs from 'fs';

const filePath = './components/BookingFlow.tsx';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// We want to keep lines 0 to 34 (0-indexed, so 1 to 35)
// and lines 145 to the end.
const before = lines.slice(0, 35);
const after = lines.slice(145);

fs.writeFileSync(filePath, [...before, ...after].join('\n'));
console.log('Deleted lines 36 to 145 successfully.');
