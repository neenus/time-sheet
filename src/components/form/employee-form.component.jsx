import { useState } from "react";
import ScheduleIcon from "@material-ui/icons/Schedule";
import TelegramIcon from "@material-ui/icons/Telegram";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  MenuItem,
  Button,
  Container,
  makeStyles,
  Typography,
  TextField
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  container: {
    padding: theme.spacing(0),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem"
  },
  schedule: {
    margin: theme.spacing(0),
    fontSize: "4rem"
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(0),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

export default function EmployeeForm() {
  const classes = useStyles();
  const [period, setPeriod] = useState("");
  const [hours, setHours] = useState("");
  const [employee, setEmployee] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetInitialState = () => {
    setEmployee("");
    setPeriod("");
    setHours("");
  };

  const handleChange = event => {
    const { value, name } = event.target;

    switch (name) {
      case "period":
        setPeriod(value);
        break;
      case "hours":
        setHours(value);
        break;
      case "employee":
        setEmployee(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const endpoit =
      "https://enoccmh976.execute-api.ca-central-1.amazonaws.com/default/hhpm";
    const body = JSON.stringify({
      employee,
      period,
      hours
    });

    const requestOptions = {
      method: "POST",
      body
    };

    try {
      const response = await fetch(endpoit, requestOptions);
      if (!response.ok) throw new Error("Error in fetch request");
      setSuccess(true);
    } catch (error) {
      setError("An unknown error occured");
    }
    setIsLoading(false);
    resetInitialState();
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Container className={classes.container}>
          <ScheduleIcon className={classes.schedule}></ScheduleIcon>
          <Typography component="h2" variant="h6">
            SUBMIT YOUR HOURS
          </Typography>
          <form
            className={classes.form}
            noValidate
            onSubmit={e => handleSubmit(e)}
          >
            {error && <p className="error">{error}</p>}
            {success && (
              <p className="success">
                Thank you {employee}! info submitted successfully{" "}
              </p>
            )}
            <TextField
              fullWidth
              variant="outlined"
              required
              name="employee"
              select
              label="Employee Name"
              onChange={handleChange}
              value={employee}
            >
              <MenuItem value={"Salam Al-Jajika"}>Salam Al-jajika</MenuItem>
              <MenuItem value={"Fouad A Shamoon"}>Fouad A Shamoon</MenuItem>
            </TextField>
            <TextField
              fullWidth
              variant="outlined"
              label="Pay Period"
              name="period"
              select
              inputProps={{ autoComplete: "none" }}
              required
              onChange={handleChange}
              value={period}
            >
              <MenuItem value="1">Jun 19, 2021 to Jul 2, 2021</MenuItem>
              <MenuItem value="2">Jul 3, 2021 to Jul 16, 2021</MenuItem>
            </TextField>
            <TextField
              fullWidth
              variant="outlined"
              required
              name="hours"
              label="Hours"
              type="number"
              autoComplete="off"
              onChange={handleChange}
              value={hours}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              children="Submit"
              endIcon={<TelegramIcon />}
              disabled={isLoading}
            >
              {isLoading ? "Sending info..." : "Submit"}
            </Button>
          </form>
        </Container>
      </div>
    </Container>
  );
}
