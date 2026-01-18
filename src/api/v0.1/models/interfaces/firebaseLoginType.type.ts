export type FirebaseLoginType = {
    firebaseUid: string;
    email: string | null;
    emailVerified: boolean;
    provider: string;
    displayName: string | null;
    photoUrl: string | null;
};