import { Paper } from "@mui/material";
import * as React from "react";
import { MdNewLabel } from "react-icons/md";

export function MuiRichTextToolbar(props: {
    id: string;
    fields: boolean;
}): JSX.Element {
    return (
        <Paper id={props.id}>
            <span className="ql-formats">
                <select className="ql-header" defaultValue="5">
                    <option value="1">Header 1</option>
                    <option value="2">Header 2</option>
                    <option value="3">Header 3</option>
                    <option value="4">Header 4</option>
                    <option value="5">Normal</option>
                </select>
                <select className="ql-size" defaultValue="medium">
                    <option value="small">Small</option>
                    <option value="medium">Normal</option>
                    <option value="large">Large</option>
                </select>
            </span>
            <span className="ql-formats">
                <button className="ql-bold" />
                <button className="ql-italic" />
                <button className="ql-underline" />
                <button className="ql-strike" />
                <button className="ql-code" />
            </span>
            <span className="ql-formats">
                <select className="ql-align" />
                <button className="ql-list" value="ordered" />
                <button className="ql-list" value="bullet" />
            </span>
            <span className="ql-formats">
                <button className="ql-script" value="super" />
                <button className="ql-script" value="sub" />
                <button className="ql-blockquote" />
            </span>
            <span className="ql-formats">
                <button className="ql-link" />
                <button className="ql-image" />
            </span>
            <span className="ql-formats">
                <button className="ql-code-block" />
                <button className="ql-clean" />
            </span>
            {props.fields && (
                <span className="ql-formats">
                    <button
                        className="ql-customField"
                        style={{ width: "fit-content", whiteSpace: "nowrap" }}
                    >
                        <MdNewLabel size={24} /> Add Field
                    </button>
                </span>
            )}
        </Paper>
    );
}
