import { Moment } from "moment";
import { createContext } from "react";

export type UserInfo = {
    first: string;
    last: string;
    phone: string;
    email: string;
    date: Moment;
};

export type TemplateField = {
    label: string;
    wide?: boolean;
    placeholder?: string;
};

export type Template = {
    name: string;
    desc: string;
    fields: {
        [key: string]: TemplateField;
    };
    text: string;
};

export type FieldContextType = {
    fields: {
        [key: string]: TemplateField;
    };
};
export const FieldContext = createContext<FieldContextType | null>(null);

export const defaultFields: {
    [key: string]: TemplateField;
} = {
    first: {
        label: "First Name",
    },
    last: {
        label: "Last Name",
    },
    phone: {
        label: "Phone Number",
    },
    email: {
        label: "Email",
    },
    date: {
        label: "Date",
    },
};
