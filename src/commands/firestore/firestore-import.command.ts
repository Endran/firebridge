import {FirebaseAdmin} from '../../firebase-admin';
import * as fs from 'fs';
import {firestoreImport} from 'node-firestore-import-export/dist/lib';
import {constructRef} from '../../util';
import {Command} from '../command';

export class FirestoreImportCommand implements Command {
    static KEY = 'FIRESTORE.IMPORT';
    format = ` { "action":"FIRESTORE.IMPORT", "path": "__ROOT__" | "colA" | "colA/docB", "filePath": "export.json" }`;

    async execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any> {
        const filePath = `${process.cwd()}/${params.filePath}`;
        if (!fs.existsSync(filePath)) {
            return {
                error: `File ${filePath} does not exist`
            };
        }

        const data = require(filePath);

        const ref = constructRef(firebaseAdmin.firestore, params.path);
        await this.import(ref, data);

        return {
            success: true
        };
    }

    async import(ref: any, data: any): Promise<any> {
        await firestoreImport(data, ref);
    }
}
