/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat',     // new feature
        'fix',      // bug fix
        'docs',     // documentation only
        'style',    // formatting, whitespace (no logic change)
        'refactor', // code change that is neither feat nor fix
        'perf',     // performance improvement
        'test',     // adding or fixing tests
        'build',    // build system or external dependency changes
        'ci',       // CI/CD configuration
        'chore',    // other changes (maintenance, tooling)
        'revert',   // reverting a previous commit
      ],
    ],
    // scope is optional but must be one of these if provided
    'scope-enum': [
      1,
      'always',
      [
        'client',   // client/ — React frontend
        'server',   // server/ — Express backend
        'database', // database/ — data storage/scripts
        'scripts',  // scripts/ — utility scripts
        'deps',     // dependency upgrades
        'config',   // project configuration files
        'agents',   // .agents/ skills and workflow docs
        'docs',     // docs/ — architecture docs and ADRs
      ],
    ],
    // subject must not be empty and must not end with a period
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    // header max 72 chars (body can be longer)
    'header-max-length': [2, 'always', 72],
    // body and footer must have blank line before
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
};
