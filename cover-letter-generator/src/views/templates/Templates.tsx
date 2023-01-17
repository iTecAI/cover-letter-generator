import { useEffect, useState } from "react";
import { Template } from "../../types";
import { Masonry } from "@mui/lab";
import {
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
    TextField,
    Typography,
} from "@mui/material";
import { useForm } from "../../util/forms";
import { Stack } from "@mui/system";
import RichTextEditor from "../../util/text-editor/RichTextEditor";

const path = window.require("node:path");
const fs = window.require("node:fs/promises");

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
        fs.writeFile(
            path.join(".", "templates", file),
            JSON.stringify({
                name: vals.name,
                desc: vals.desc,
                fields: fields,
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

    return (
        <Dialog open={open} onClose={close} fullWidth={true} maxWidth={"md"}>
            <DialogTitle>
                Edit Template "{template.name}"
                <Typography variant="subtitle1" sx={{ opacity: 0.5 }}>
                    {file}
                </Typography>
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
                    <RichTextEditor
                        value={vals.text}
                        onChange={(value) => setVals("text", value)}
                        height="512px"
                    />
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

function TemplateItem(props: {
    template: Template;
    file: string;
}): JSX.Element {
    const { template, file } = props;
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <Card className="template">
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
        </>
    );
}

export function TemplatePage() {
    const [templates, setTemplates] = useState<[Template, string][]>([]);
    const [lastEvent, setLastEvent] = useState<Object>({});

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
        <Masonry spacing={2} className="template-grid" columns={5}>
            {templates.map((t) => (
                <TemplateItem template={t[0]} file={t[1]} key={t[1]} />
            ))}
        </Masonry>
    );
}
