import {FirebaseAdmin} from '../../firebase-admin';
import * as fs from 'fs';
import {firestoreExport} from 'node-firestore-import-export/dist/lib';
import {constructRef} from '../../util';
import {Command} from '../command';

export class FirestoreExportCommand implements Command {
    static KEY = 'FIRESTORE.EXPORT';
    format = ` { "action":"FIRESTORE.EXPORT", "path": "__ROOT__" | "colA" | "colA/docB", "filePath": "export.json" }`;

    async execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any> {
        const filePath = `${process.cwd()}/${params.filePath}`;
        if (fs.existsSync(filePath)) {
            return {error: `File ${filePath} already exists`};
        }

        fs.openSync(filePath, 'w');

        let data: any;
        const ref = constructRef(firebaseAdmin.firestore, params.path);
        data = await this.export(ref);

        if (!data) {
            return {error: 'Could not export data'};
        }

        fs.writeFileSync(filePath, JSON.stringify(data));

        return {success: true};
    }

    async export(ref: any): Promise<any> {
        return await firestoreExport(ref);
    }
}
