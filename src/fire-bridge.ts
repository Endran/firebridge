import {Command as Cmd} from 'commander';
import * as expressjs from 'express';
import * as bodyParser from 'body-parser';
import {FirestoreGetCommand} from './commands/firestore/firestore-get.command';
import {FirestoreSetCommand} from './commands/firestore/firestore-set.command';
import {FirestoreClearCommand} from './commands/firestore/firestore-clear.command';
import {FirestoreImportCommand} from './commands/firestore/firestore-import.command';
import {FirestoreExportCommand} from './commands/firestore/firestore-export.command';
import {FirebaseAdmin} from './firebase-admin';
import {Command} from './commands/command';
import {NullCommand} from './commands/null.command';
import {AuthDeleteCommand} from './commands/auth/auth-delete.command';
import {AuthAddCommand} from './commands/auth/auth-add.command';

export class FireBridge {
    private openCommands: {[p: string]: Command} = {
        [AuthDeleteCommand.KEY]: new AuthDeleteCommand(),
        [AuthAddCommand.KEY]: new AuthAddCommand(),
        [FirestoreGetCommand.KEY]: new FirestoreGetCommand(),
        [FirestoreSetCommand.KEY]: new FirestoreSetCommand(),
        [FirestoreClearCommand.KEY]: new FirestoreClearCommand(),
        [FirestoreImportCommand.KEY]: new FirestoreImportCommand(),
        [FirestoreExportCommand.KEY]: new FirestoreExportCommand()
    };
    private isVerbose: boolean;

    constructor(private firebaseAdmin: FirebaseAdmin) {}

    initCommander(commander: Cmd) {
        commander.option('--verbose', 'Enable verbose logging.');
        commander.option('-O, --open <number>', 'Starts applicants as server on the given port. Prevents --command.');
        commander.option('-C, --command <path>', 'Executes a single command from path. Is ignored when --open is used.');

        commander.on('--help', () => {
            console.log('');
            console.log('Examples:');
            console.log('  $ fire-bridge -A firebase-admin.json --open 4201');
            console.log('  $ fire-bridge -A firebase-admin.json --cli params.json');
            console.log('');
            console.log('Expected data format per command');
            Object.keys(this.openCommands).forEach(key => {
                console.log(`${key}: ${this.openCommands[key].format}`);
            });
            console.log('');
        });
    }

    async start(commander: Cmd) {
        this.isVerbose = commander.verbose;
        if (commander.open) {
            await this.startServer(commander.open);
        } else if (commander.cli) {
            await this.startCli(commander.cli);
        }
    }

    private startServer(port: number) {
        const app = expressjs();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        app.post('/', async (request, response) => {
            const params = request.body;
            const command = this.openCommands[params.action] || new NullCommand();
            const result = await this.executeCommand(command, params);
            response.send({params, result});
        });

        app.listen(port, err => {
            if (err) {
                console.log('An error occurred', err);
            } else {
                console.log(`FireBridge is listening on ${port}`);
            }
        });

        return new Promise(() => {
            console.log(`Server started`);
        });
    }

    private async startCli(filePath: string) {
        const params = require(`${process.cwd()}/${filePath}`);
        const command = this.openCommands[params.action] || new NullCommand();
        return await this.executeCommand(command, params);
    }

    private async executeCommand(command, params) {
        console.log(`Start ${params.action}`);
        if (this.isVerbose) {
            console.log(params);
        }

        let res: any;
        try {
            res = await command.execute(this.firebaseAdmin, params);
        } catch (e) {
            console.log(`Exception occurred`, e);
            res = {error: e.message, exception: e};
        }

        console.log(`Finished ${params.action} ` + (res.success ? 'successfully' : `with error: ${res.error}`));
        if (this.isVerbose) {
            console.log(res);
        }
        return res;
    }
}
