import ReactQuill from "react-quill";
import { Quill, Delta } from "quill";
import "react-quill/dist/quill.snow.css";
import "./overrides.scss";
import { Box } from "@mui/system";
import { MuiRichTextToolbar } from "./MuiToolbar";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from "@mui/material";
import { useForm } from "../forms";
import { FieldContext, TemplateField } from "../../types";

const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "code",
    "code-block",
    "customField",
    "script",
    "align",
];

type TriggerArgument =
    | {
          quill: Quill;
          selection: { index: number; length: number };
          selected: string;
          normalized_selection: string;
      }
    | false;

function handleCustomField() {
    const quill: Quill = this.quill;

    // Pull the setCfOpen function back out of the event handler
    const trigger: (val: TriggerArgument) => void = quill.root.parentElement
        .onanimationend as any;
    const selection = quill.getSelection();
    if (selection === null) {
        return;
    }
    const selected = quill.getText(selection.index, selection.length);
    const normalized_selection = selected
        .replace(/ /g, "_")
        .replace(/[^\w]/g, "")
        .toLowerCase();
    /*quill.updateContents(
        {
            ops: [
                selection.index === 0
                    ? false
                    : {
                            retain: selection.index,
                        },
                {
                    delete: selection.length,
                },
                {
                    insert: `{{${normalized_selection}:${selected}}}`,
                },
            ].filter(Boolean),
        } as Delta,
        "user"
    );*/
    trigger({ quill, selection, selected, normalized_selection });
}

function CustomFieldDialog(props: {
    customField: TriggerArgument;
    setCustomField: (value: TriggerArgument) => void;
}) {
    const { customField, setCustomField } = props;
    const [form, setForm, resetForm] = useForm<
        TemplateField & { name: string }
    >({
        name: "",
        label: "",
        wide: false,
        placeholder: "",
    });

    useEffect(() => {
        if (customField) {
            resetForm({
                name: customField.normalized_selection,
                label: customField.selected,
                wide: false,
                placeholder: "",
            });
        } else {
            resetForm({
                name: "",
                label: "",
                wide: false,
                placeholder: "",
            });
        }
    }, [customField]);

    const fields = useContext(FieldContext);

    return fields ? (
        <Dialog
            className="cf-dialog"
            open={customField !== false}
            onClose={() => setCustomField(false)}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>Insert Field</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ marginTop: "8px" }}>
                    <Autocomplete
                        value={form.name as any}
                        onChange={(event, value: any) => {
                            setForm(
                                "name",
                                value
                                    ? value
                                          .replace(/ /g, "_")
                                          .replace(/[^\w]/g, "")
                                          .toLowerCase()
                                    : ""
                            );
                        }}
                        fullWidth
                        options={Object.keys(fields.fields)}
                        renderInput={(params) => (
                            <TextField label="Field Name" {...params} />
                        )}
                        freeSolo
                    />
                    <Stack
                        spacing={2}
                        sx={{
                            opacity: Object.keys(fields.fields).includes(
                                form.name
                            )
                                ? 0.5
                                : 1,
                            pointerEvents: Object.keys(fields.fields).includes(
                                form.name
                            )
                                ? "none"
                                : "all",
                        }}
                    >
                        <TextField
                            value={
                                Object.keys(fields.fields).includes(form.name)
                                    ? fields.fields[form.name].label
                                    : form.label
                            }
                            onChange={(event) =>
                                setForm("label", event.target.value)
                            }
                            fullWidth
                            label="Field Label"
                        />
                        <TextField
                            value={
                                Object.keys(fields.fields).includes(form.name)
                                    ? fields.fields[form.name].placeholder
                                    : form.placeholder
                            }
                            onChange={(event) =>
                                setForm("placeholder", event.target.value)
                            }
                            fullWidth
                            label="Field Placeholder"
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    disabled={
                        !(
                            form.name.length > 0 &&
                            (Object.keys(fields.fields).includes(form.name)
                                ? fields.fields[form.name].label
                                : form.label
                            ).length > 0
                        )
                    }
                    onClick={() => {
                        if (customField) {
                            customField.quill.updateContents(
                                {
                                    ops: [
                                        customField.selection.index === 0
                                            ? false
                                            : {
                                                  retain: customField.selection
                                                      .index,
                                              },
                                        {
                                            delete: customField.selection
                                                .length,
                                        },
                                        {
                                            insert: `{{${customField.normalized_selection}:${customField.selected}}}`,
                                        },
                                    ].filter(Boolean),
                                } as Delta,
                                "user"
                            );
                            setCustomField(false);
                        }
                    }}
                >
                    Insert
                </Button>
            </DialogActions>
        </Dialog>
    ) : (
        <></>
    );
}

export default function RichTextEditor(props: {
    height?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    fields?: boolean;
}): JSX.Element {
    const [cfOpen, setCfOpen] = useState<TriggerArgument>(false);
    const quillRef = useRef<ReactQuill>();

    // Stick the setCfOpen function into an event handler to pass it out of scope
    useMemo(() => {
        if (Boolean(quillRef.current)) {
            (quillRef.current.getEditingArea() as any).onanimationend = (
                value: any
            ) => setCfOpen(value);
        }
    }, [quillRef.current]);

    const modules = {
        toolbar: {
            container: "#mui-editor",
            handlers: {
                customField: handleCustomField,
            },
        },
    };

    return (
        <>
            <Box
                className={`rich-editor-container${
                    props.disabled ? " disabled" : ""
                }`}
            >
                <MuiRichTextToolbar
                    id={"mui-editor"}
                    fields={props.fields ?? false}
                />
                <ReactQuill
                    theme="snow"
                    value={props.value}
                    onChange={props.onChange}
                    style={{
                        height: props.height
                            ? `calc(${props.height} - 40px)`
                            : undefined,
                    }}
                    modules={modules}
                    formats={formats}
                    className={`rich-editor${
                        props.disabled ? " disabled" : ""
                    }`}
                    ref={quillRef}
                />
            </Box>
            <CustomFieldDialog
                customField={cfOpen}
                setCustomField={setCfOpen}
            />
        </>
    );
}
