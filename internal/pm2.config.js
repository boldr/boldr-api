// Added packages.
const chalk = require('chalk');

// Gets `PM2` mode.
const mode = process.env.PM2_MODE;

// Possible `PM2` modes.
const modes = ['dev', 'dev-cluster', 'prod', 'prod-cluster'];

// Checks by given `PM2` mode.
switch (mode) {
  // Development server with reload/debug mode for server (dev).
  case modes[0]: {
    // Exports `PM2` config.
    module.exports = {
      // Application name.
      name: 'boldrapi-dev',
      // Server entry point (the bootstrapper).
      script: 'src/index.js',
      // Arguments passed via CLI to script.
      args: '--color',
      // Options to pass.
      node_args: '--inspect=5858',
      // Enable watch & restart feature to specific folders.
      watch: ['src', 'internal'],
      // Ignore some files or folders for the watch feature.
      ignore_watch: [
        'internal',
        'db',
        'flow-typed',
        'node_modules',
        'lib',
        'coverage',
      ],
      // Environment variables.
      env: { NODE_ENV: 'development' },
      // Log date format.
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSSS',
      // Time to wait before restarting a crashed app (in milliseconds).
      restart_delay: 5000,
    };
    break;
  }
  // Development server with reload/cluster mode for server (dev-cluster).
  case modes[1]: {
    // Exports `PM2` config.
    module.exports = {
      // Application name.
      name: 'dev-cluster',
      // Server entry point (the bootstrapper).
      script: 'src/index.js',
      // Arguments passed via CLI to script.
      args: '--color',
      // Enable watch & restart feature to specific folders.
      watch: ['src', 'interal'],
      // Ignore some files or folders for the watch feature.
      ignore_watch: [
        'internal',
        'db',
        'flow-typed',
        'node_modules',
        'lib',
        'coverage',
      ],
      // Environment variables.
      env: { NODE_ENV: 'development' },
      // Log date format.
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSSS',
      // Will start maximum processes depending on available CPUs.
      instances: 0,
      // Cluster mode.
      exec_mode: 'cluster',
      // Time to wait before restarting a crashed app (in milliseconds).
      restart_delay: 5000,
    };
    break;
  }
  // Production server (prod).
  case modes[2]: {
    // Exports `PM2` config.
    module.exports = {
      // Application name.
      name: 'prod',
      // Server entry point (the bootstrapper).
      script: 'lib/index.js',
      // Arguments passed via CLI to script.
      args: '--color',
      // Disables watch & restart feature.
      watch: false,
      // Environment variables.
      env: { NODE_ENV: 'production' },
      // Log date format.
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSSS',
      // Time to wait before restarting a crashed app (in milliseconds).
      restart_delay: 5000,
    };
    break;
  }
  // Production server with cluster mode (prod-cluster).
  case modes[3]: {
    // Exports `PM2` config.
    module.exports = {
      // Application name.
      name: 'prod-cluster',
      // Server entry point (the bootstrapper).
      script: 'lib/idex.js',
      // Arguments passed via CLI to script.
      args: '--color',
      // Disables watch & restart feature.
      watch: false,
      // Environment variables.
      env: { NODE_ENV: 'production' },
      // Log date format.
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSSS',
      // Will start maximum processes depending on available CPUs.
      instances: 0,
      // Cluster mode.
      exec_mode: 'cluster',
      // Time to wait before restarting a crashed app (in milliseconds).
      restart_delay: 5000,
    };
    break;
  }
  // If mode is incorrect throws an error.
  /* eslint-disable */
  default: {
    throw new Error(
      `${chalk.bold.dim('Incorrect mode:')} ${chalk.bold.red(mode)}${chalk.bold.dim('.')} ` +
        `${chalk.bold.dim('Correct modes are')} ${chalk.bold.cyan(modes.join(', '))}${chalk.bold.dim('!')}`,
    );
  }
}
