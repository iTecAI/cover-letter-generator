import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Avatar,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import "./style.scss";
import {
    MdAdd,
    MdCheck,
    MdDescription,
    MdExpandMore,
    MdPerson,
    MdTableRows,
} from "react-icons/md";
import { MaskedTextField } from "../../util/masked-input/MaskedInput";
import moment, { Moment, fn } from "moment";
import { DatePicker } from "@mui/x-date-pickers";
import { useForm } from "../../util/forms";
import { CoverLetter, Template, UserInfo } from "../../types";
import { useEffect, useState } from "react";
import { Masonry } from "@mui/lab";

const path = window.require("node:path");
const fs = window.require("node:fs/promises");

function CoverLetterItem(props: {
    letter: CoverLetter;
    setLetter: (letter: CoverLetter) => void;
    templates: [Template, string][];
}): JSX.Element {
    const temp: Template | null =
        props.templates.filter((v) => v[1] === props.letter.template)[0][0] ??
        null;

    return temp ? (
        <Accordion className="cover-letter-item">
            <AccordionSummary expandIcon={<MdExpandMore size={24} />}>
                <Stack spacing={0.5}>
                    <TextField
                        variant="standard"
                        value={props.letter.name}
                        onChange={(event) =>
                            props.setLetter({
                                ...props.letter,
                                name: event.target.value,
                            })
                        }
                        onClick={(event) => event.stopPropagation()}
                    />
                    <Typography variant="subtitle1" className="template-name">
                        {temp.name}
                    </Typography>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    {Object.keys(temp.fields).map((value) => {
                        const field = temp.fields[value];
                        return (
                            <Grid item xs={field.wide ? 12 : 6} key={value}>
                                <TextField
                                    label={field.label}
                                    placeholder={field.placeholder ?? undefined}
                                    value={props.letter.fields[value] ?? ""}
                                    onChange={(event) =>
                                        props.setLetter({
                                            ...props.letter,
                                            fields: {
                                                ...props.letter.fields,
                                                [value]: event.target.value,
                                            },
                                        })
                                    }
                                    fullWidth
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </AccordionDetails>
        </Accordion>
    ) : (
        <></>
    );
}

export function CoverLetterPage() {
    const [userInfo, setUserInfo] = useForm<UserInfo>({
        first: "",
        last: "",
        phone: "",
        email: "",
        date: moment(),
    });

    const [templates, setTemplates] = useState<[Template, string][]>([]);
    const [lastEvent, setLastEvent] = useState<Object>({});
    const [selectedTemplate, setSelectedTemplate] = useState<
        null | ({ file: string } & Template)
    >(null);
    const [letters, setLetters] = useState<{ [key: string]: CoverLetter }>({});

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
        if (selectedTemplate === null && newTemplates.length > 0) {
            setSelectedTemplate({
                file: newTemplates[0][1],
                ...newTemplates[0][0],
            });
        }
    }

    async function updateLetters() {
        const letterFiles: string[] = await fs.readdir("output");
        const newLetters: { [key: string]: CoverLetter } = {};
        for (const file of letterFiles) {
            if (file.endsWith(".letter.json")) {
                try {
                    const contents: string = await fs.readFile(
                        path.join(".", "output", file),
                        {
                            encoding: "utf8",
                        }
                    );
                    newLetters[file.split(".")[0]] = JSON.parse(contents);
                } catch (err) {
                    return;
                }
            }
        }

        if (JSON.stringify(newLetters) !== JSON.stringify(letters)) {
            setLetters(newLetters);
        }
    }

    useEffect(() => {
        (async function () {
            const cache: string[] = await fs.readdir("output");
            const fnames = Object.keys(letters).map((v) => `${v}.letter.json`);
            if (fnames.length === 0) {
                for (const f of cache) {
                    if (!fnames.includes(f)) {
                        fs.rm(path.join("output", f));
                    }
                }
            }
        })();
    }, [letters]);

    useEffect(() => {
        const watcherAbort = new AbortController();
        updateTemplates();
        updateLetters();
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
        (async () => {
            const watcher = fs.watch("output", {
                signal: watcherAbort.signal,
            });
            for await (const event of watcher) {
                if (JSON.stringify(event) !== JSON.stringify(lastEvent)) {
                    setLastEvent(event);
                    updateLetters();
                }
            }
        })();
    }, []);

    return (
        <Stack spacing={2} className="form-root">
            <Card variant="outlined" className="user-info section">
                <CardHeader
                    title="User Info"
                    subheader="Info About You"
                    avatar={
                        <Avatar>
                            <MdPerson size={24} />
                        </Avatar>
                    }
                />
                <CardContent>
                    <Grid spacing={2} className="fields" container>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                required
                                className="field name-first"
                                label="First Name"
                                placeholder="Jane"
                                value={userInfo.first}
                                onChange={(event) =>
                                    setUserInfo("first", event.target.value)
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                required
                                className="field name-last"
                                label="Last Name"
                                placeholder="Doe"
                                value={userInfo.last}
                                onChange={(event) =>
                                    setUserInfo("last", event.target.value)
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <MaskedTextField
                                fullWidth
                                required
                                className="field phone-number"
                                label="Phone Number"
                                placeholder="(555) 000-0000"
                                mask="(#00) 000-0000"
                                options={{
                                    definitions: {
                                        "#": /[1-9]/,
                                    },
                                }}
                                value={userInfo.phone}
                                onChange={(value) =>
                                    setUserInfo("phone", value)
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <MaskedTextField
                                fullWidth
                                required
                                className="field email"
                                label="Email"
                                placeholder="user@example.com"
                                mask="a@b.b"
                                options={{
                                    blocks: {
                                        a: { mask: /[^@]*/g },
                                        b: { mask: /[a-zA-Z0-9\-]*/g },
                                    },
                                }}
                                value={userInfo.email}
                                onChange={(value) =>
                                    setUserInfo("email", value)
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <DatePicker
                                value={userInfo.date ?? moment()}
                                onChange={(value: Moment) =>
                                    setUserInfo("date", value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth required />
                                )}
                                label="Date"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card variant="outlined" className="letters section">
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<MdCheck size={24} />}
                    className="generate-btn"
                    onClick={() =>
                        Object.keys(letters).forEach((v) => {
                            const letter: CoverLetter = letters[v];
                            const template: Template = (templates.filter(
                                (t) => t[1] === letter.template
                            )[0] ?? [])[0];
                            if (template === undefined) {
                                return;
                            }
                            let generatedText: string = template.text;
                            for (const field of Object.keys(template.fields)) {
                                generatedText = generatedText.replace(
                                    new RegExp(`\{\{${field}:[^\}]*\}\}`, "g"),
                                    letter.fields[field] ?? "UNKNOWN"
                                );
                            }
                            for (const field of Object.keys(userInfo)) {
                                generatedText = generatedText.replace(
                                    new RegExp(`\{\{${field}:[^\}]*\}\}`, "g"),
                                    (userInfo as any)[field] ?? "UNKNOWN"
                                );
                            }
                            console.log(generatedText);
                        })
                    }
                >
                    Generate All
                </Button>
                <CardHeader
                    title="Letter Generator"
                    subheader="Individual Letters"
                    avatar={
                        <Avatar>
                            <MdDescription size={24} />
                        </Avatar>
                    }
                />
                <CardContent>
                    <Stack spacing={2}>
                        <Stack spacing={1} direction={"row"}>
                            {templates.length > 0 ? (
                                <Autocomplete
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <MdTableRows size={20} />
                                                ),
                                            }}
                                        />
                                    )}
                                    options={templates.map((v) => {
                                        return { file: v[1], ...v[0] };
                                    })}
                                    getOptionLabel={(option) =>
                                        typeof option === "string"
                                            ? option
                                            : option.name
                                    }
                                    value={
                                        selectedTemplate ?? {
                                            file: templates[0][1],
                                            ...templates[0][0],
                                        }
                                    }
                                    onChange={(event, value) =>
                                        setSelectedTemplate(value)
                                    }
                                    multiple={false}
                                    freeSolo={false}
                                    disableClearable
                                    fullWidth
                                    sx={{ width: "calc(100% - 64px)" }}
                                    isOptionEqualToValue={(option, value) =>
                                        true
                                    }
                                />
                            ) : (
                                <TextField
                                    disabled
                                    InputProps={{
                                        startAdornment: (
                                            <MdTableRows size={20} />
                                        ),
                                    }}
                                    fullWidth
                                    variant="outlined"
                                />
                            )}
                            <IconButton
                                color="success"
                                sx={{
                                    minWidth: "56px",
                                }}
                                disabled={selectedTemplate === null}
                                onClick={() => {
                                    if (selectedTemplate !== null) {
                                        const letterFields: {
                                            [key: string]: string;
                                        } = {};
                                        Object.keys(
                                            selectedTemplate.fields
                                        ).forEach(
                                            (v) => (letterFields[v] = "")
                                        );

                                        const key: string = Math.random()
                                            .toString()
                                            .split(".")[1];

                                        setLetters({
                                            ...letters,
                                            [key]: {
                                                name: "New Letter",
                                                template: selectedTemplate.file,
                                                fields: letterFields,
                                            },
                                        });

                                        fs.writeFile(
                                            path.join(
                                                "output",
                                                `${key}.letter.json`
                                            ),
                                            JSON.stringify({
                                                name: "New Letter",
                                                template: selectedTemplate.file,
                                                fields: letterFields,
                                            }),
                                            { encoding: "utf8" }
                                        );
                                    }
                                }}
                            >
                                <MdAdd size={20} />
                            </IconButton>
                        </Stack>
                        <Masonry className="letters" spacing={2} columns={2}>
                            {Object.keys(letters).map((v) => (
                                <CoverLetterItem
                                    letter={letters[v]}
                                    setLetter={(letter) => {
                                        setLetters({
                                            ...letters,
                                            [v]: letter,
                                        });
                                        fs.writeFile(
                                            path.join(
                                                "output",
                                                `${v}.letter.json`
                                            ),
                                            JSON.stringify(letter),
                                            { encoding: "utf8" }
                                        );
                                    }}
                                    key={v}
                                    templates={templates}
                                />
                            ))}
                        </Masonry>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}
