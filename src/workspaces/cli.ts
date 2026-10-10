import { program } from 'commander';
import process from 'node:process';
import { check, type Options } from './index';

program
    .name('workspaces')
    .description('Check that each workspace lockfile pins what the root lockfile pins')
    .option('--fix', 'Rewrite the workspace lockfiles from the root lockfile')
    .action((options: Options) => {
        if (!check(options)) {
            process.exitCode = 1;
        }
    })
    .parse(process.argv);
