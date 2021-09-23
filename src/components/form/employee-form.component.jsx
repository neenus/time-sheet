import { useReducer, useEffect, useRef } from "react";
import ScheduleIcon from "@material-ui/icons/Schedule";
import TelegramIcon from "@material-ui/icons/Telegram";
import MuiAlert from "@material-ui/lab/Alert";
import {
  CssBaseline,
  MenuItem,
  Button,
  Container,
  makeStyles,
  Typography,
  TextField,
  Snackbar
} from "@material-ui/core";
import apiCall from "../../api/apiUtils";
import { formatDate } from "../../utils/time";
import ReCAPTCHA from "react-google-recaptcha";

const timeSheetReducer = (state, action) => {
  switch (action.type) {
    case "setEmployeesList":
      return {
        ...state,
        employees: action.payload
      };
    case "setpayPeriodList":
      return {
        ...state,
        payperiods: action.payload
      };
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
        selectedEmployee: "",
        period: "",
        hours: "",
        snackbar: {
          open: true,
          severity: action.type,
          message: "Thank you, info submitted successfully!"
        }
      };
    case "error":
      return {
        ...state,
        isLoading: false,
        selectedEmployee: "",
        period: "",
        hours: "",
        snackbar: {
          open: true,
          severity: action.type,
          message: action.errorMessage
        }
      };
    case "serverError":
      return {
        ...state,
        error: "An unknown server error occured",
        isLoading: false,
        selectedEmployee: "",
        period: "",
        hours: ""
      };
    case "formUpdate":
      return {
        ...state,
        [action.field]: action.value
      };
    case "validationErrors":
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.field]: true
        },
        validationErrorMessages: {
          ...state.validationErrorMessages,
          [action.field]: action.errorMessage
        },
        isLoading: false
      };
    case "resetValidationErrors":
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.field]: false
        },
        validationErrorMessages: {
          ...state.validationErrorMessages,
          [action.field]: action.errorMessage
        },
        isLoading: false
      };
    case "snackbarClose":
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          open: false
        }
      };
    default:
      break;
  }
  return state;
};

const initialState = {
  employees: [],
  payperiods: [],
  selectedEmployee: "",
  period: "",
  hours: "",
  isLoading: false,
  validationErrors: {
    selectedEmployee: false,
    period: false,
    hours: false
  },
  validationErrorMessages: {
    selectedEmployee: "",
    period: "",
    hours: ""
  },
  snackbar: {
    open: false,
    message: "",
    severity: "success"
  }
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

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const EmployeeForm = () => {
  const recaptchaRef = useRef();

  useEffect(() => {
    const getEmployees = async () => {
      try {
        const employeeList = await apiCall("employees");
        employeeList.data.length > 0
          ? dispatch({
              type: "setEmployeesList",
              payload: employeeList.data
            })
          : dispatch({
              type: "error",
              errorMessage:
                "Something went wrong loading information from the server, please try again later..."
            });
      } catch (error) {
        console.error(error);
        dispatch({
          type: "error",
          errorMessage:
            "Something went wrong loading information from the server, please try again later..."
        });
      }
    };

    const getPayPeriods = async () => {
      try {
        const { data } = await apiCall("payperiods");

        const payPeriodList = data.filter(
          // payperiods are bi-weekly
          // 604800000 is 7 days in milliseconds
          // filter payperiods and only show three past payperiods

          period =>
            new Date(period.periodEnd) > Date.now() - 604800000 * 6 &&
            new Date(period.periodEnd) < Date.now() + 604800000
        );
        payPeriodList.length > 0
          ? dispatch({
              type: "setpayPeriodList",
              payload: payPeriodList
            })
          : dispatch({
              type: "error",
              errorMessage:
                "Something went wrong loading information from the server, please try again later..."
            });
      } catch (error) {
        console.error(error);
        dispatch({
          type: "error",
          errorMessage:
            "Something went wrong loading information from the server, please try again later..."
        });
      }
    };

    getEmployees();
    getPayPeriods();
  }, []);

  const classes = useStyles();
  const [state, dispatch] = useReducer(timeSheetReducer, initialState);

  const { selectedEmployee, period, hours, isLoading } = state;
  const handleOnBlur = payload =>
    !state[payload]
      ? dispatch({
          type: "validationErrors",
          errorMessage:
            payload === "selectedEmployee"
              ? "employee field is required"
              : `${payload} field is required.`,
          field: payload
        })
      : dispatch({
          type: "resetValidationErrors",
          errorMessage: "",
          field: payload
        });

  const validate = () => {
    const inputFields = { selectedEmployee, period, hours };
    return Object.values(inputFields).every(x => x !== "");
  };

  const handleSnackbarClose = () => {
    dispatch({
      type: "snackbarClose"
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const token = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    dispatch({ type: "submit" });

    const endpoit =
      "https://enoccmh976.execute-api.ca-central-1.amazonaws.com/default/hhpm";

    const body = JSON.stringify({
      selectedEmployee,
      period,
      hours,
      token
    });

    const requestOptions = {
      method: "POST",
      body
    };

    if (validate()) {
      try {
        const response = await fetch(endpoit, requestOptions);
        if (!response.ok)
          return dispatch({
            type: "error",
            errorMessage:
              "Sorry... Something went wrong while trying to send the information."
          });
        dispatch({ type: "success" });
      } catch (error) {
        dispatch({ type: "serverError" });
      }
    } else {
      const inputFields = { selectedEmployee, period, hours };

      for (const field in inputFields) {
        if (inputFields[field] === "") {
          dispatch({
            type: "validationErrors",
            errorMessage: `${field} field is required.`,
            field: field
          });
        }
      }
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
            <Snackbar
              open={state.snackbar.open}
              autoHideDuration={8000}
              onClose={handleSnackbarClose}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={state.snackbar.severity}
              >
                {state.snackbar.message}
              </Alert>
            </Snackbar>
            <TextField
              onBlur={e => handleOnBlur(e.target.name)}
              error={state.validationErrors.selectedEmployee}
              helperText={state.validationErrorMessages.selectedEmployee}
              fullWidth
              variant="outlined"
              required
              name="selectedEmployee"
              select
              label="Employee Name"
              onChange={e =>
                dispatch({
                  type: "formUpdate",
                  field: "selectedEmployee",
                  value: e.target.value
                })
              }
              value={selectedEmployee}
            >
              {state.employees.map(employee => (
                <MenuItem key={employee._id} value={employee.name}>
                  {employee.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              onBlur={e => handleOnBlur(e.target.name)}
              error={state.validationErrors.period}
              helperText={state.validationErrorMessages.period}
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
              {state.payperiods.map(period => (
                <MenuItem
                  key={period.periodNum}
                  value={`${formatDate(period.periodStart)} to  ${formatDate(
                    period.periodEnd
                  )}`}
                >
                  {formatDate(period.periodStart)} to{" "}
                  {formatDate(period.periodEnd)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              onBlur={e => handleOnBlur(e.target.name)}
              error={state.validationErrors.hours}
              helperText={state.validationErrorMessages.hours}
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
      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={process.env.REACT_APP_SITE_KEY}
      />
    </Container>
  );
};

export default EmployeeForm;
