export default interface UserInterface {
    name: string;
    email: string;
    password: string;
    _id: string;
    passwordReset: string;
    emailCreds: {
        userName: string;
        userPass: string;
    };
    isAdmin?: boolean;
}