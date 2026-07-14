import { spawn } from 'node:child_process';

const maxAttempts = Number.parseInt(process.env.TINA_BUILD_MAX_ATTEMPTS || '6', 10);
const retryDelayMs = Number.parseInt(process.env.TINA_BUILD_RETRY_DELAY_MS || '30000', 10);

const retryableMessages = [
  "The local GraphQL schema doesn't match the remote GraphQL schema",
  'The remote GraphQL schema does not exist',
  'The remote Tina schema does not exist',
];

const sleep = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs));

const refreshTinaCloudSchema = async () => {
  const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
  const branch = process.env.NEXT_PUBLIC_TINA_BRANCH;
  const token = process.env.TINA_TOKEN;

  if (!clientId || !branch || !token) {
    console.log('Skipping TinaCloud schema refresh because TinaCloud environment variables are not fully configured.');
    return;
  }

  const url = new URL(`https://content.tinajs.io/db/${encodeURIComponent(clientId)}/reset/${encodeURIComponent(branch)}`);
  url.searchParams.set('refreshSchema', 'true');

  console.log(`Requesting TinaCloud schema refresh for branch '${branch}'...`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-KEY': token,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TinaCloud schema refresh failed with ${response.status}: ${body}`);
  }
};

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
  await refreshTinaCloudSchema();
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