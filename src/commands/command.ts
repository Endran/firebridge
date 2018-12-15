import {FirebaseAdmin} from '../firebase-admin';

export interface Command {
    format: string;
    execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any>;
}
