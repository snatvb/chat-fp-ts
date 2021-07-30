interface Process extends NodeJS.Process {
  env: { ENDPOINT: string; NODE_ENV: string }
}
declare var process: Process
