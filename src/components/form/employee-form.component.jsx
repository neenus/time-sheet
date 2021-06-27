import { useReducer } from "react";
import ScheduleIcon from "@material-ui/icons/Schedule";
import TelegramIcon from "@material-ui/icons/Telegram";
import {
  CssBaseline,
  MenuItem,
  Button,
  Container,
  makeStyles,
  Typography,
  TextField
} from "@material-ui/core";

const timeSheetReducer = (state, action) => {
  switch (action.type) {
    case "submit":
      return {
        ...state,
        isLoading: true,
        error: ""
      };
    case "success":
      return {
        ...state,
        success: true,
        isLoading: false,
        employee: "",
        period: "",
        hours: ""
      };
    case "error":
      return {
        ...state,
        error: "Error in fetch request",
        isLoading: false,
        employee: "",
        period: "",
        hours: ""
      };
    case "serverError":
      return {
        ...state,
        error: "An unknown server error occured",
        isLoading: false,
        employee: "",
        period: "",
        hours: ""
      };
    case "formUpdate":
      return {
        ...state,
        [action.field]: action.value
      };
    default:
      break;
  }
  return state;
};

const initialState = {
  employee: "",
  period: "",
  hours: "",
  isLoading: false,
  error: "",
  success: false
};

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
  const [state, dispatch] = useReducer(timeSheetReducer, initialState);

  const { employee, period, hours, isLoading, error, success } = state;

  const handleSubmit = async e => {
    e.preventDefault();

    dispatch({ type: "submit" });

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
      if (!response.ok) dispatch({ type: "error" });
      dispatch({ type: "success" });
    } catch (error) {
      dispatch({ type: "serverError" });
    }
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
              <p className="success">Thank you! info submitted successfully.</p>
            )}
            <TextField
              fullWidth
              variant="outlined"
              required
              name="employee"
              select
              label="Employee Name"
              onChange={e =>
                dispatch({
                  type: "formUpdate",
                  field: "employee",
                  value: e.target.value
                })
              }
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
              onChange={e =>
                dispatch({
                  type: "formUpdate",
                  field: "period",
                  value: e.target.value
                })
              }
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
              onChange={e =>
                dispatch({
                  type: "formUpdate",
                  field: "hours",
                  value: e.target.value
                })
              }
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
