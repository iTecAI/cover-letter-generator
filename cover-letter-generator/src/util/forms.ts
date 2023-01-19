import { useReducer } from "react";

function isSetAction(obj: any): obj is { action: "set"; data: any } {
    return Object.keys(obj).includes("action") && obj.action === "set";
}

function reduceForm(
    state: { [key: string]: any },
    action: { field: string; value: any } | { action: "set"; data: any }
) {
    if (isSetAction(action)) {
        return action.data;
    } else {
        const newState = { ...state };
        newState[action.field] = action.value;
        return newState;
    }
}

export function useForm<T>(
    initial?: T
): [T, (name: keyof T, value: any) => void, (data: T) => void] {
    const [data, dispatch] = useReducer(reduceForm, initial ?? {});
    return [
        data as T,
        (name: keyof T, value: any) =>
            dispatch({ field: name as string, value }),
        (data: T) => dispatch({ action: "set", data }),
    ];
}
