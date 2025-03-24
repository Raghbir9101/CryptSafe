export interface TableInterface {
    name: string;
    description: string;
    fields: FieldInterface[];
    sharedWith: SharedWithInterface[];
}

interface FieldInterface {
    name: string;
    type: "TEXT" | "NUMBER" | "DATE" | "BOOLEAN" | "SELECT" | "MULTISELECT";
    required: boolean;
    hidden: boolean;
    options: string[];
}

interface SharedWithInterface {
    email: string;
    fieldPermission: FieldPermissionInterface[];
    isBlocked: boolean;
}

interface FieldPermissionInterface {
    fieldName: string;
    permission: string;
}