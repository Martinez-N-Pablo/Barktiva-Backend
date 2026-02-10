import type { FilterQuery, UpdateQuery } from "mongoose";
import User from "../models/user.model.js";
import { UserInterface } from "../models/interfaces/user.interface.js";
import { link } from "fs";

type UserDoc = Awaited<ReturnType<typeof User.findOne>>;

type UpdateProfileInput = {
  displayName?: string;
  photoUrl?: string;
};

type LinkFirebaseInput = {
  firebaseUid: string;
  provider: string;
  displayName?: string;
  photoUrl?: string;
};

type CreateFromFirebaseInput = {
  email: string;
  firebaseUid: string;
  provider: string;
  displayName?: string;
  photoUrl?: string;
};

const defaultUpdateOptions = {
  new: true,
  runValidators: true,
  context: "query" as const,
};

function buildProfilePatch(input: UpdateProfileInput) {
  return {
    ...(input.displayName ? { name: input.displayName } : {}),
    ...(input.photoUrl ? { photo: input.photoUrl } : {}),
  };
}

export const UserRepository = {
    // 1) Finders
    findUserByFirebaseUid(firebase_uid: string): Promise<any> {
        return User.findOne({ firebase_uid });
    },
    findUserByEmail(email: string): Promise<any> {
        return User.findOne({ email });
    },

    // 2) Updaters
    updateLoginAndProfileByFirebaseUid(firebase_uid: string, profile: UpdateProfileInput): Promise<any> {
        return User.findOneAndUpdate(
            { firebase_uid },
            {
                $set: {
                    last_login_at: new Date(),
                    ...buildProfilePatch(profile),
                },
            },
            defaultUpdateOptions
        );
    },

    /**
     * 
     */
    linkFirebaseToExistingUserWithEmail(email: string, firebaseProfile: LinkFirebaseInput): Promise<any> {
        return User.findOneAndUpdate(
            { email },
            {
                $set: {
                    firebase_uid: firebaseProfile.firebaseUid,
                    provider: firebaseProfile.provider,
                    email_verified: true,
                    last_login_at: new Date(),
                    ...buildProfilePatch(firebaseProfile)
                }
            },
            defaultUpdateOptions
        );
    },

    linkFirebaseToUserById(userId: string, firebaseProfile: LinkFirebaseInput): Promise<any> {
        return User.findByIdAndUpdate(
            userId, 
            {
                $set: {
                    firebase_uid: firebaseProfile.firebaseUid,
                    provider: firebaseProfile.provider,
                    email_verified: true,
                    last_login_at: new Date(),
                    ...buildProfilePatch(firebaseProfile)
                }
            },
            defaultUpdateOptions
        );
    },

    // 3) Create
    createUserWithFirebaseData(firebaseProfile: CreateFromFirebaseInput): Promise<any> {
        return User.create({
            email: firebaseProfile.email,
            firebase_uid: firebaseProfile.firebaseUid,
            email_verified: true,
            ...buildProfilePatch(firebaseProfile)
        });
    },
};