import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    Stack,
    TextField,
} from "@mui/material";
import "./style.scss";
import {
    MdAdd,
    MdDescription,
    MdExpandMore,
    MdPerson,
    MdTableRows,
} from "react-icons/md";
import { MaskedTextField } from "../../util/masked-input/MaskedInput";
import moment, { Moment } from "moment";
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
}): JSX.Element {
    return (
        <Accordion className="cover-letter-item">
            <AccordionSummary expandIcon={<MdExpandMore size={24} />}>
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
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    {Object.keys(props.letter.template.fields).map((value) => {
                        const field = props.letter.template.fields[value];
                        return (
                            <Grid item xs={field.wide ? 12 : 6}>
                                <TextField
                                    label={field.label}
                                    placeholder={field.placeholder ?? undefined}
                                    value={props.letter.fields[value]}
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

    const [selectedTemplate, setSelectedTemplate] = useState<"" | Template>("");
    const [letters, setLetters] = useState<{ [key: string]: CoverLetter }>({});

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
                                value={selectedTemplate}
                                onChange={(event, value) =>
                                    typeof value === "string"
                                        ? setSelectedTemplate("")
                                        : setSelectedTemplate(value)
                                }
                                multiple={false}
                                freeSolo={false}
                                disableClearable
                                fullWidth
                                sx={{ width: "calc(100% - 64px)" }}
                            />
                            <IconButton
                                color="success"
                                sx={{
                                    minWidth: "56px",
                                }}
                                disabled={selectedTemplate === ""}
                                onClick={() => {
                                    if (selectedTemplate !== "") {
                                        const letterFields: {
                                            [key: string]: string;
                                        } = {};
                                        Object.keys(selectedTemplate).forEach(
                                            (v) => (letterFields[v] = "")
                                        );

                                        setLetters({
                                            ...letters,
                                            [Math.random().toString()]: {
                                                name: "New Letter",
                                                template: selectedTemplate,
                                                fields: letterFields,
                                            },
                                        });
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
                                    setLetter={(letter) =>
                                        setLetters({
                                            ...letters,
                                            [v]: letter,
                                        })
                                    }
                                    key={v}
                                />
                            ))}
                        </Masonry>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}
