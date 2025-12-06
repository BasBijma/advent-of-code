import { spawn } from 'child_process';

const day = process.argv[2];
const part = process.argv[3] ? process.argv[3] : 'part1';

const dayRegex = /^day([1-9]|1[0-9]|2[0-5])$/;

if (!day || !dayRegex.test(day)) {
   console.error('Please provide a valid day as an argument (day1 to day25); `yarn elf day1`');
   process.exit(1);
}

if (part !== 'part1' && part !== 'part2') {
   console.error('Please provide a valid part as an argument (part 1 or 2); `yarn elf day1 part1`');
   process.exit(1);
}

const command = `node -e \"console.clear()\" && tsx package_scripts/welcome.ts && tsx watch --clear-screen=false ./${day}/${part}.ts`;

console.log(`Executing command: ${command}`);

const child = spawn(command, { shell: true , stdio: 'inherit'});