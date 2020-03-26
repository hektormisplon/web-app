import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = process.env.FIREBASE;

export const app = firebase.initializeApp(config);
export const auth = firebase.auth();

export const { RecaptchaVerifier } = firebase.auth;
auth.useDeviceLanguage();

export const db = firebase.database();