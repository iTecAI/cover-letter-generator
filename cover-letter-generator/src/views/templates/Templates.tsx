import { useEffect, useState } from "react";
import {
    FieldContext,
    Template,
    TemplateField,
    defaultFields,
} from "../../types";
import { Masonry } from "@mui/lab";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useForm } from "../../util/forms";
import { Stack } from "@mui/system";
import RichTextEditor from "../../util/text-editor/RichTextEditor";
import "./style.scss";
import { MdAdd, MdDelete } from "react-icons/md";

const path = window.require("node:path");
const fs = window.require("node:fs/promises");

function TemplateFieldItem(props: {
    name: string;
    field: TemplateField;
    setField: (name: string, field: TemplateField) => void;
}): JSX.Element {
    const { name, field } = props;
    const [fieldConf, setFieldConf] = useForm<TemplateField>({
        label: field.label,
        wide: field.wide ?? false,
        placeholder: field.placeholder ?? "",
    });

    useEffect(() => {
        props.setField(name, fieldConf);
    }, [fieldConf]);

    return (
        <Grid item xs={4}>
            <Paper
                elevation={Object.keys(defaultFields).includes(name) ? 0 : 1}
                className="field-item"
                sx={
                    Object.keys(defaultFields).includes(name)
                        ? {
                              opacity: 0.5,
                              pointerEvents: "none",
                          }
                        : undefined
                }
                variant={
                    Object.keys(defaultFields).includes(name)
                        ? "outlined"
                        : "elevation"
                }
            >
                <TextField
                    className="title"
                    fullWidth
                    value={fieldConf.label}
                    variant="standard"
                    onChange={(event) =>
                        setFieldConf("label", event.target.value)
                    }
                />
                <Typography variant="subtitle1" className="subtitle">
                    {name}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            label="Placeholder"
                            fullWidth
                            value={fieldConf.placeholder ?? ""}
                            onChange={(event) =>
                                setFieldConf("placeholder", event.target.value)
                            }
                            variant="standard"
                            className="placeholder"
                        />
                    </Grid>
                    <Grid item xs={6} className="wide-container">
                        <FormControlLabel
                            label="Wide"
                            className="wide"
                            control={
                                <Switch
                                    checked={fieldConf.wide ?? false}
                                    onChange={(event) =>
                                        setFieldConf("wide", !fieldConf.wide)
                                    }
                                />
                            }
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
}

function TemplateDialog(props: {
    template: Template;
    file: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    const { template, file, open, setOpen } = props;
    const [vals, setVals] = useForm<{
        name: string;
        desc: string;
        text: string;
    }>({
        name: template.name,
        desc: template.desc,
        text: template.text,
    });

    const [fields, setFields] = useState<{
        [key: string]: { label: string; wide?: boolean; placeholder?: string };
    }>(template.fields);

    function close() {
        setOpen(false);
    }

    function submit() {
        const filteredFields: { [key: string]: TemplateField } = {};
        Object.keys(fields).forEach((v) => {
            if (!Object.keys(defaultFields).includes(v)) {
                filteredFields[v] = fields[v];
            }
        });
        fs.writeFile(
            path.join(".", "templates", file),
            JSON.stringify({
                name: vals.name,
                desc: vals.desc,
                fields: filteredFields,
                text: vals.text,
            }),
            { encoding: "utf8" }
        );
        close();
    }

    useEffect(() => {
        setVals("name", template.name);
        setVals("desc", template.desc);
        setVals("text", template.text);
        setFields(template.fields);
    }, [open, template]);

    useEffect(() => {
        const fieldStrings = vals.text.match(/\{\{\w*:[^\}]*\}\}/g) ?? [];
        const rawFields: { label: string; name: string }[] = fieldStrings.map(
            (str) => {
                return {
                    label: str.split(":")[1].split("}}")[0],
                    name: str.split(":")[0].split("{{")[1],
                };
            }
        );
        const fieldNames: string[] = rawFields.map((v) => v.name);

        const newFields: { [key: string]: TemplateField } = JSON.parse(
            JSON.stringify(fields)
        );

        const toReplace: { label: string; name: string }[] = [];
        for (const rf of rawFields) {
            if (!Object.keys(newFields).includes(rf.name)) {
                newFields[rf.name] = {
                    label: rf.label,
                    wide: false,
                    placeholder: "",
                };
            } else {
                if (rf.label !== newFields[rf.name].label) {
                    toReplace.push({
                        label: newFields[rf.name].label,
                        name: rf.name,
                    });
                }
            }
        }

        for (const f in newFields) {
            if (!fieldNames.includes(f)) {
                newFields[f] = undefined;
            }
        }

        let newText: string = vals.text;
        for (const r of toReplace) {
            newText = newText.replace(
                new RegExp(`\{\{${r.name}:[^\}]*\}\}`, "g"),
                `{{${r.name}:${r.label}}}`
            );
        }

        const autocompletes: string[] = (
            newText.match(/\$\w*(?=\W|$)/g) ?? []
        ).map((v) => v);
        for (const a of autocompletes) {
            const name = a.split("$")[1];
            if (Object.keys(newFields).includes(name)) {
                newText = newText.replace(
                    a,
                    `{{${name}:${newFields[name].label}}}`
                );
            }
            if (Object.keys(defaultFields).includes(name)) {
                newText = newText.replace(
                    a,
                    `{{${name}:${defaultFields[name].label}}}`
                );
            }
        }

        if (newText !== vals.text) {
            setVals("text", newText);
        }
        if (JSON.stringify(newFields) !== JSON.stringify(fields)) {
            setFields(JSON.parse(JSON.stringify(newFields)));
        }
    }, [vals.text, fields]);

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth={true}
            maxWidth={"lg"}
            className="template-dialog"
        >
            <DialogTitle>
                Edit Template "{template.name}"
                <div
                    style={{
                        opacity: 0.5,
                        fontWeight: "normal",
                        fontSize: "14px",
                    }}
                >
                    {file}
                </div>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ marginTop: "8px" }}>
                    <TextField
                        fullWidth
                        label="Template Name"
                        placeholder="New Template"
                        value={vals.name}
                        onChange={(event) =>
                            setVals("name", event.target.value)
                        }
                    />
                    <TextField
                        sx={{ marginTop: "8px" }}
                        fullWidth
                        label="Template Description"
                        placeholder="A Fancy Template"
                        value={vals.desc}
                        onChange={(event) =>
                            setVals("desc", event.target.value)
                        }
                    />
                    <Paper variant="outlined" className="field-container">
                        <Grid container spacing={1}>
                            {Object.keys(fields)
                                .filter((v) => Boolean(fields[v]))
                                .filter(
                                    (v) =>
                                        !Object.keys(defaultFields).includes(v)
                                )
                                .map((f) => (
                                    <TemplateFieldItem
                                        name={f}
                                        field={fields[f]}
                                        key={f}
                                        setField={(name, field) => {
                                            setFields({
                                                ...fields,
                                                [name]: field,
                                            });
                                        }}
                                    />
                                ))}
                        </Grid>
                    </Paper>
                    <FieldContext.Provider
                        value={{ fields: { ...defaultFields, ...fields } }}
                    >
                        <RichTextEditor
                            value={vals.text}
                            onChange={(value) => setVals("text", value)}
                            height="384px"
                            fields
                        />
                    </FieldContext.Provider>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={close}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function CreateTemplateDialog(props: {
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    const { open, setOpen } = props;
    const [vals, setVals] = useForm<{
        name: string;
        desc: string;
        text: string;
    }>({
        name: "",
        desc: "",
        text: "",
    });

    const [fields, setFields] = useState<{
        [key: string]: { label: string; wide?: boolean; placeholder?: string };
    }>({});

    function close() {
        setOpen(false);
    }

    function submit() {
        const filteredFields: { [key: string]: TemplateField } = {};
        Object.keys(fields).forEach((v) => {
            if (!Object.keys(defaultFields).includes(v)) {
                filteredFields[v] = fields[v];
            }
        });
        fs.writeFile(
            path.join(
                ".",
                "templates",
                vals.name
                    .replace(/ /g, "_")
                    .replace(/[^\w]/g, "")
                    .toLowerCase() + ".template.json"
            ),
            JSON.stringify({
                name: vals.name,
                desc: vals.desc,
                fields: filteredFields,
                text: vals.text,
            }),
            { encoding: "utf8" }
        );
        close();
    }

    useEffect(() => {
        setVals("name", "");
        setVals("desc", "");
        setVals("text", "");
        setFields({});
    }, [open]);

    useEffect(() => {
        const fieldStrings = vals.text.match(/\{\{\w*:[^\}]*\}\}/g) ?? [];
        const rawFields: { label: string; name: string }[] = fieldStrings.map(
            (str) => {
                return {
                    label: str.split(":")[1].split("}}")[0],
                    name: str.split(":")[0].split("{{")[1],
                };
            }
        );
        const fieldNames: string[] = rawFields.map((v) => v.name);

        const newFields: { [key: string]: TemplateField } = JSON.parse(
            JSON.stringify(fields)
        );

        const toReplace: { label: string; name: string }[] = [];
        for (const rf of rawFields) {
            if (!Object.keys(newFields).includes(rf.name)) {
                newFields[rf.name] = {
                    label: rf.label,
                    wide: false,
                    placeholder: "",
                };
            } else {
                if (rf.label !== newFields[rf.name].label) {
                    toReplace.push({
                        label: newFields[rf.name].label,
                        name: rf.name,
                    });
                }
            }
        }

        for (const f in newFields) {
            if (!fieldNames.includes(f)) {
                newFields[f] = undefined;
            }
        }

        let newText: string = vals.text;
        for (const r of toReplace) {
            newText = newText.replace(
                new RegExp(`\{\{${r.name}:[^\}]*\}\}`, "g"),
                `{{${r.name}:${r.label}}}`
            );
        }

        const autocompletes: string[] = (
            newText.match(/\$\w*(?=\W|$)/g) ?? []
        ).map((v) => v);
        for (const a of autocompletes) {
            const name = a.split("$")[1];
            if (Object.keys(newFields).includes(name)) {
                newText = newText.replace(
                    a,
                    `{{${name}:${newFields[name].label}}}`
                );
            }
            if (Object.keys(defaultFields).includes(name)) {
                newText = newText.replace(
                    a,
                    `{{${name}:${defaultFields[name].label}}}`
                );
            }
        }

        if (newText !== vals.text) {
            setVals("text", newText);
        }
        if (JSON.stringify(newFields) !== JSON.stringify(fields)) {
            setFields(JSON.parse(JSON.stringify(newFields)));
        }
    }, [vals.text, fields, vals, open]);

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth={true}
            maxWidth={"lg"}
            className="template-dialog"
        >
            <DialogTitle>Create New Template</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ marginTop: "8px" }}>
                    <TextField
                        fullWidth
                        label="Template Name"
                        placeholder="New Template"
                        value={vals.name}
                        onChange={(event) =>
                            setVals("name", event.target.value)
                        }
                    />
                    <TextField
                        sx={{ marginTop: "8px" }}
                        fullWidth
                        label="Template Description"
                        placeholder="A Fancy Template"
                        value={vals.desc}
                        onChange={(event) =>
                            setVals("desc", event.target.value)
                        }
                    />
                    <Paper variant="outlined" className="field-container">
                        <Grid container spacing={1}>
                            {Object.keys(fields)
                                .filter((v) => Boolean(fields[v]))
                                .filter(
                                    (v) =>
                                        !Object.keys(defaultFields).includes(v)
                                )
                                .map((f) => (
                                    <TemplateFieldItem
                                        name={f}
                                        field={fields[f]}
                                        key={f}
                                        setField={(name, field) => {
                                            setFields({
                                                ...fields,
                                                [name]: field,
                                            });
                                        }}
                                    />
                                ))}
                        </Grid>
                    </Paper>
                    <FieldContext.Provider
                        value={{ fields: { ...defaultFields, ...fields } }}
                    >
                        <RichTextEditor
                            value={vals.text}
                            onChange={(value) => setVals("text", value)}
                            height="384px"
                            fields
                        />
                    </FieldContext.Provider>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={close}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={submit}
                    disabled={vals.name.length === 0}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function TemplateItem(props: {
    template: Template;
    file: string;
}): JSX.Element {
    const { template, file } = props;
    const [open, setOpen] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    return (
        <>
            <Card className="template">
                <IconButton
                    className="delete-template"
                    color="error"
                    size="large"
                    onClick={() => setDeleting(true)}
                >
                    <MdDelete size={24} />
                </IconButton>
                <CardActionArea onClick={() => setOpen(true)}>
                    <CardHeader
                        title={template.name}
                        subheader={template.desc}
                    />
                    <CardContent>
                        <Card className="fields" variant="outlined">
                            <CardHeader
                                title="Custom Fields"
                                titleTypographyProps={{ variant: "overline" }}
                                sx={{ paddingBottom: "0px" }}
                            />
                            <CardContent>
                                {Object.keys(template.fields).map((field) => (
                                    <Chip
                                        sx={{
                                            marginRight: "4px",
                                            marginBottom: "4px",
                                        }}
                                        label={template.fields[field].label}
                                        key={field}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </CardContent>
                </CardActionArea>
            </Card>
            <TemplateDialog open={open} setOpen={setOpen} {...props} />
            <Dialog open={deleting} onClose={() => setDeleting(false)}>
                <DialogTitle>Confirm Deletion of "{template.name}"</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete "{template.name}"? This
                    action is irreversible.
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() => setDeleting(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            fs.rm(path.join(".", "templates", file), {
                                force: true,
                            });
                            setDeleting(false);
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export function TemplatePage() {
    const [templates, setTemplates] = useState<[Template, string][]>([]);
    const [lastEvent, setLastEvent] = useState<Object>({});
    const [creating, setCreating] = useState<boolean>(false);

    async function updateTemplates() {
        const templateFiles: string[] = await fs.readdir("templates");
        const newTemplates: [Template, string][] = [];
        for (const file of templateFiles) {
            if (file.endsWith(".template.json")) {
                try {
                    const contents: string = await fs.readFile(
                        path.join(".", "templates", file),
                        {
                            encoding: "utf8",
                        }
                    );
                    newTemplates.push([JSON.parse(contents), file]);
                } catch (err) {
                    console.error(err.message);
                }
            }
        }

        setTemplates(newTemplates);
    }

    useEffect(() => {
        const watcherAbort = new AbortController();
        updateTemplates();
        (async () => {
            const watcher = fs.watch("templates", {
                signal: watcherAbort.signal,
            });
            for await (const event of watcher) {
                if (JSON.stringify(event) !== JSON.stringify(lastEvent)) {
                    setLastEvent(event);
                    updateTemplates();
                }
            }
        })();
    }, []);

    return (
        <Box className="template-wrapper">
            <Masonry spacing={2} className="template-grid" columns={5}>
                {templates.map((t) => (
                    <TemplateItem template={t[0]} file={t[1]} key={t[1]} />
                ))}
            </Masonry>
            <Fab
                className="new-template"
                color="primary"
                onClick={() => setCreating(true)}
            >
                <MdAdd size={24} />
            </Fab>
            <CreateTemplateDialog open={creating} setOpen={setCreating} />
        </Box>
    );
}
