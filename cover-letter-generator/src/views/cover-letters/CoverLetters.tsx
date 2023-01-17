import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Stack,
    TextField,
} from "@mui/material";
import "./style.scss";
import { MdPerson } from "react-icons/md";
import { MaskedTextField } from "../../util/masked-input/MaskedInput";
import moment, { Moment } from "moment";
import { DatePicker } from "@mui/x-date-pickers";
import { useForm } from "../../util/forms";
import { UserInfo } from "../../types";

export function CoverLetterPage() {
    const [userInfo, setUserInfo] = useForm<UserInfo>({
        first: "",
        last: "",
        phone: "",
        email: "",
        date: moment(),
    });

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
        </Stack>
    );
}
