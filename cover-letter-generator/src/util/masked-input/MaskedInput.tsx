import { IMaskInput } from "react-imask";
import * as React from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface MaskedProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
    mask: any;
}

const TextMaskCustom = React.forwardRef<HTMLElement, MaskedProps>(
    function TextMaskCustom(props, ref) {
        const { onChange, mask, ...other } = props;
        return (
            <IMaskInput
                {...other}
                inputRef={ref as any}
                onAccept={(value: any) =>
                    onChange({ target: { name: props.name, value } })
                }
                overwrite
                mask={mask}
            />
        );
    }
);

export function MaskedTextField(
    props: TextFieldProps & {
        onChange?: (value: string) => void;
        value?: string;
        mask: any;
        options?: any;
        label: string;
    }
): JSX.Element {
    const [value, setValue] = React.useState<string>(props.value ?? "");

    React.useEffect(() => {
        if (props.value !== value) {
            props.onChange && props.onChange(value);
        }
    }, [value]);

    React.useEffect(() => {
        setValue(props.value ?? "");
    }, [props.value]);

    return (
        <TextField
            {...props}
            InputProps={{
                ...props.InputProps,
                inputComponent: TextMaskCustom as any,
                inputProps: {
                    ...((props.InputProps ?? {}).inputProps ?? {}),
                    mask: props.mask,
                    ...(props.options ?? {}),
                },
            }}
            value={value}
            onChange={(event) => setValue(event.target.value)}
        />
    );
}
