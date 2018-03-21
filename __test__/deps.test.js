'use strict';

require('jest');

const deps = require('../lib/deps.js');

// required for testing console.logs
global.console = {
  log: jest.fn(),
};

const assets = `${__dirname}/assets`;
const packageDeps = {
  both: {
    dependencies: 'both1 both2',
    devDependencies: 'both1 both2 both3',
  },
  full: {
    dependencies: 'full1 full2',
    devDependencies: 'full1 full2 full3',
  },
  dev: {
    dependencies: 'dev1 dev2',
    devDependencies: 'dev1 dev2 dev3',
  },
  none: {
    dependencies: null,
    devDependencies: null,
  },
  versions: {
    dependencies: 'dep1@1.2.3 dep2@5.0.0',
    devDependencies: 'devDep1@4.18.1 devDep2@12.1.0 devDep3@2.9.0',
  },
};

describe('lib/deps.js ', () => {
  describe('#get', () => {
    it('should get both deps', () => {
      return deps.get(`${assets}/package.json`)
        .then(pkgDeps => {
          expect(pkgDeps.dependencies).toEqual(packageDeps.versions.dependencies);
          expect(pkgDeps.devDependencies).toEqual(packageDeps.versions.devDependencies);
        });
    });

    it('should only get full deps and not include versions', () => {
      return deps.get(`${assets}/package.json`, 'full', true)
        .then(pkgDeps => {
          expect(pkgDeps.dependencies).toEqual('dep1 dep2');
          expect(pkgDeps.devDependencies).toBeNull();
        });
    });

    it('should only get dev deps', () => {
      return deps.get(`${assets}/package.json`, 'dev')
        .then(pkgDeps => {
          expect(pkgDeps.dependencies).toBeNull();
          expect(pkgDeps.devDependencies).toEqual(packageDeps.versions.devDependencies);
        });
    });
  });

  describe('#print', () => {
    it('should log the deps', () => {
      deps.print(packageDeps.both, 'both');
      expect(global.console.log)
        .toHaveBeenCalledWith(`\n  \x1b[34m${'Dependencies:'} \x1b[35m${'both1 both2'}\x1b[0m`);
      expect(global.console.log)
        .toHaveBeenCalledWith(`\n  \x1b[34m${'Dev Dependencies:'} \x1b[35m${'both1 both2 both3'}\x1b[0m`);
    });
    it('should log only full deps', () => {
      deps.print(packageDeps.full, 'full');
      expect(global.console.log)
        .toHaveBeenCalledWith(`\n  \x1b[34m${'Dependencies:'} \x1b[35m${'full1 full2'}\x1b[0m`);
      expect(global.console.log).not
        .toHaveBeenCalledWith(`\n  \x1b[34m${'Dev Dependencies:'} \x1b[35m${'full1 full2 full3'}\x1b[0m`);
    });
    it('should log only dev deps', () => {
      deps.print(packageDeps.dev, 'dev');
      expect(global.console.log).not
        .toHaveBeenCalledWith(`\n  \x1b[34m${'Dependencies:'} \x1b[35m${'dev1 dev2'}\x1b[0m`);
      expect(global.console.log)
        .toHaveBeenCalledWith(`\n  \x1b[34m${'Dev Dependencies:'} \x1b[35m${'dev1 dev2 dev3'}\x1b[0m`);
    });
    it('should log no deps', () => {
      deps.print(packageDeps.none, 'both');
      expect(global.console.log)
        .toHaveBeenCalledWith(`\n  \x1b[34m${'Dependencies:'} \x1b[35m${'None found'}\x1b[0m`);
      expect(global.console.log)
        .toHaveBeenCalledWith(`\n  \x1b[34m${'Dev Dependencies:'} \x1b[35m${'None found'}\x1b[0m`);
    });
  });

  describe('#prepCopy', () => {
    it('should return an install string for both dependencies', () => {
      expect(deps.prepCopy(packageDeps.both, 'both'))
        .toEqual('npm i both1 both2; npm i both1 both2 both3 -D');
    });
    it('should return an install string for full dependencies', () => {
      expect(deps.prepCopy(packageDeps.full, 'full'))
        .toEqual('npm i full1 full2');
    });
    it('should return an install string for dev dependencies', () => {
      expect(deps.prepCopy(packageDeps.dev, 'dev'))
        .toEqual('npm i dev1 dev2 dev3 -D');
    });
    it('should return an empty string if no dependencies', () => {
      expect(deps.prepCopy(packageDeps.none, 'both'))
        .toEqual('');
    });
  });
});
