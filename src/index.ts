import {FirebaseAdmin} from './firebase-admin';
import * as commander from 'commander';
import {FireBridge} from './fire-bridge';

const main = async function() {
    const cmd = commander.version('0.1.0').option('-A, --serviceAccount <path>', 'Required. Location of service account JSON file.');

    const firebaseAdmin = new FirebaseAdmin();
    const fireBridge = new FireBridge(firebaseAdmin);
    fireBridge.initCommander(cmd);
    cmd.parse(process.argv);

    if (cmd.serviceAccount === undefined) {
        throw Error('--serviceAccount is required');
    }
    firebaseAdmin.init(cmd.serviceAccount);

    await fireBridge.start(cmd);
};

if (require.main === module) {
    main()
        .then(() => {
            console.log(`Finished`);
            process.exit(0);
        })
        .catch(e => {
            console.log(`Finished with error`, e);
            process.exit(e.code || 1);
        });
}
