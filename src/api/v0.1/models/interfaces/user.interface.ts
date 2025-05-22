export interface UserInterface {
  name: string;
  surname?: string;
  email: string;
  password: string;
  photo?: string;
  birthdate?: Date;
  dogsID?: string[];
  tasksID?: string[];
  role?: 'admin' | 'user';
}