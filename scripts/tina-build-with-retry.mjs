import { spawn } from 'node:child_process';

const maxAttempts = Number.parseInt(process.env.TINA_BUILD_MAX_ATTEMPTS || '6', 10);
const retryDelayMs = Number.parseInt(process.env.TINA_BUILD_RETRY_DELAY_MS || '30000', 10);

const retryableMessages = [
  "The local GraphQL schema doesn't match the remote GraphQL schema",
  'The remote GraphQL schema does not exist',
  'The remote Tina schema does not exist',
];

const sleep = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs));

const runTinaBuild = () => new Promise((resolve) => {
  const child = spawn('tinacms', ['build'], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  let output = '';

  child.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    process.stdout.write(text);
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    output += text;
    process.stderr.write(text);
  });

  child.on('close', (exitCode) => {
    resolve({ exitCode, output });
  });
});

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = await runTinaBuild();

  if (result.exitCode === 0) {
    process.exit(0);
  }

  const shouldRetry = retryableMessages.some((message) => result.output.includes(message));
  if (!shouldRetry || attempt === maxAttempts) {
    process.exit(result.exitCode || 1);
  }

  console.log(`TinaCloud schema/index is not ready yet. Retrying tinacms build in ${retryDelayMs / 1000}s (${attempt + 1}/${maxAttempts})...`);
  await sleep(retryDelayMs);
}