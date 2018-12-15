import {Command} from './command';
import {FirebaseAdmin} from '../firebase-admin';

export class NullCommand implements Command {
    static KEY = 'NULL_COMMAND';
    format: '';

    async execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any> {
        console.log(`You should not be here`);
        console.log(params);
        return {
            error: 'Unknown action'
        };
    }
}
