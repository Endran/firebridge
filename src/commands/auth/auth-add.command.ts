import {Command} from '../command';
import {FirebaseAdmin} from '../../firebase-admin';
import {asyncForEach, sleep} from '../../util';
import * as fs from 'fs';

export class AuthAddCommand implements Command {
    static KEY = 'AUTH.ADD';
    format = `         { "action":"AUTH.ADD", "filePath?": "users.json", "uid?": "USER_ID_1", "email?": "user@example.com", "password?": "atLeastSixChars" }`;

    public async execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any> {
        let users: [{uid: string; email: string; password: string}];
        if (params.filePath) {
            const filePath = `${process.cwd()}/${params.filePath}`;
            if (!fs.existsSync(filePath)) {
                return {
                    error: `File ${filePath} does not exist`
                };
            }
            users = require(filePath);
        } else if (params.uid && params.email && params.password) {
            users = [{uid: params.uid, email: params.email, password: params.password}];
        } else {
            return {
                error: 'Did not find user info in params'
            };
        }

        await asyncForEach(users, async user => {
            await firebaseAdmin.auth.createUser(user);
        });

        return {
            success: true
        };
    }
}
