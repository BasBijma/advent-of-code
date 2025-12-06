// 'fs' stands for File System. It's a built-in Node.js module that allows you to CRUD files and directories.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 'process' is a global object that provides information about the currently running Node.js program.
// 'argv' (argument vector) is an array containing the command line arguments passed when launching Node.js.
const dayNumber = process.argv[2];

if (!dayNumber) {
  console.error('Please provide a day number. Usage: yarn new <number>');
  process.exit(1);
}

// 'cwd' stands for Current Working Directory.
// process.cwd() returns the absolute path to the folder where you ran the script from.
const sourceDir = path.join(process.cwd(), 'day template');
const targetDir = path.join(process.cwd(), `day${dayNumber}`);

if (!fs.existsSync(sourceDir)) {
  console.error(`Template directory "${sourceDir}" not found!`);
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error(`Directory "${targetDir}" already exists!`);
  process.exit(1);
}

try {
  // 'cpSync' stands for Copy Synchronously.
  // It copies files or folders from source to destination.
  // 'Sync' means the code pauses here until the copy is finished (blocking execution).
  fs.cpSync(sourceDir, targetDir, { recursive: true });
  console.log(`Successfully created day${dayNumber} from template!`);
} catch (err) {
  console.error('Error copying directory:', err);
  process.exit(1);
}
