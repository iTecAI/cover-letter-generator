import { Moment } from "moment";

export type UserInfo = {
    first: string;
    last: string;
    phone: string;
    email: string;
    date: Moment;
};

export type Template = {
    name: string;
    desc: string;
    fields: {
        [key: string]: { label: string; wide?: boolean; placeholder?: string };
    };
    text: string;
};
