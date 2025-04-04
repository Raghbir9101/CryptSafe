export interface TableInterface {
    _id: string;
    name: string;
    description: string;
    fields: FieldInterface[];
    sharedWith: SharedWithInterface[];
    createdBy: string;
    createdAt: string;
    updatedBy: object | string;
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

export interface WorkingTimeAccessInterface {
    day: "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
    accessTime: [string, string][];
    enabled: boolean;
}

export interface NetworkAccessInterface {
    IP_ADDRESS: string;
    enabled: boolean;
    comment: string;
    type: 'IPv4' | 'IPv6';
    _id?: string;
}

export interface SharedWithInterface {
    email: string;
    fieldPermission: FieldPermissionInterface[];
    tablePermissions: {
        edit: boolean;
        delete: boolean;
    }
    rowsPerPageLimit: number;
    isBlocked: boolean;
    workingTimeAccess: WorkingTimeAccessInterface[];
    networkAccess: NetworkAccessInterface[];
    restrictNetwork: boolean;
    restrictWorkingTime: boolean;
}

export interface FieldPermissionInterface {
    fieldName: string;
    permission: string;
    filter: string[]
}