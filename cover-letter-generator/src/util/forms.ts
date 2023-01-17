import { useReducer } from "react";

function reduceForm(
    state: { [key: string]: any },
    action: { field: string; value: any }
) {
    const newState = JSON.parse(JSON.stringify(state));
    newState[action.field] = action.value;
    return newState;
}

export function useForm<T>(
    initial?: T
): [T, (name: keyof T, value: any) => void] {
    const [data, dispatch] = useReducer(reduceForm, initial ?? {});
    return [
        data as T,
        (name: keyof T, value: any) =>
            dispatch({ field: name as string, value }),
    ];
}
