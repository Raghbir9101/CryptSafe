export interface TableInterface {
    _id: string;
    name: string;
    description: string;
    fields: FieldInterface[];
    sharedWith: SharedWithInterface[];
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
}

export interface FieldInterface {
    name: string;
    type: "TEXT" | "NUMBER" | "DATE" | "BOOLEAN" | "SELECT" | "MULTISELECT";
    unique: boolean;
    required: boolean;
    hidden: boolean;
    options?: string[];
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