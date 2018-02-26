'use strict';

const clipboard = require('clipboardy');
const deps = require('./deps.js');

module.exports = (path, options) => {
  if (!path) throw new Error('Please provide a path');
  
  // ensure path leads to a potential package.json
  if (!(/.*package.json$/).test(path)) {
    if (!path.endsWith('/')) path += '/';
    path += 'package.json';
  }

  const { 
    type,
    suppress,
    install,
    copy,
  } = options;
  
  return deps.get(path, type)
    .then(pkgDeps => {
      // print packages unless suppressed
      if (!options.suppress) deps.print(pkgDeps, type);

      // install packages in current directory
      if (options.install) {
        // install in current directory with child_process exec
      }

      // copy packages to clipboard
      if (options.copy) {
        const commands = deps.prepCopy(pkgDeps, type);
        clipboard.write(commands);
      }
    });
};
