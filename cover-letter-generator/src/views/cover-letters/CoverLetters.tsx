import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import "./style.scss";
import { MdPerson } from "react-icons/md";
import { MaskedTextField } from "../../util/masked-input/MaskedInput";

export function CoverLetterPage() {
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
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                required
                                className="field name-last"
                                label="Last Name"
                                placeholder="Doe"
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
                                defs={{
                                    "#": /[1-9]/,
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Stack>
    );
}
