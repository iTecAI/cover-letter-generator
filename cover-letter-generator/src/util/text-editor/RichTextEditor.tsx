import ReactQuill from "react-quill";
import { Quill, Delta } from "quill";
import "react-quill/dist/quill.snow.css";
import "./overrides.scss";
import { Box } from "@mui/system";
import { MuiRichTextToolbar } from "./MuiToolbar";

function insertCustomField(value: string) {
    const quill: Quill = this.quill;
    const selection = quill.getSelection();
    const selected = quill.getText(selection.index, selection.length);
    const normalized_selection = selected
        .replace(/ /g, "_")
        .replace(/[^\w]/g, "")
        .toLowerCase();
    quill.updateContents(
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
    );
}

const modules = {
    toolbar: {
        container: "#mui-editor",
        handlers: {
            customField: insertCustomField,
        },
    },
};

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

export default function RichTextEditor(props: {
    height?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    fields?: boolean;
}): JSX.Element {
    return (
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
                className={`rich-editor${props.disabled ? " disabled" : ""}`}
            />
        </Box>
    );
}
