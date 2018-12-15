import {FirebaseAdmin} from '../../firebase-admin';
import {Command} from '../command';

export class FirestoreSetCommand implements Command {
    static KEY = 'FIRESTORE.SET';
    format = `    { "action":"FIRESTORE.SET", "path": "colA/docB", "data": {} }`;

    async execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any> {
        return {
            success: true,
            writeTime: (await firebaseAdmin.firestore.doc(params.path).set(params.data)).writeTime
        };
    }
}
