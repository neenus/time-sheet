import { useReducer, useEffect } from "react";
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
import apiCall from "../../api/apiUtils";

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
        hours: ""
      };
    case "error":
      return {
        ...state,
        error: action.errorMessage,
        isLoading: false,
        selectedEmployee: "",
        period: "",
        hours: ""
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
  error: "",
  success: false,
  validationErrors: {
    selectedEmployee: false,
    period: false,
    hours: false
  },
  validationErrorMessages: {
    selectedEmployee: "",
    period: "",
    hours: ""
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

const EmployeeForm = () => {
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
                "Something went wrong fetching employee list please try again later..."
            });
      } catch (error) {
        console.error(error);
        dispatch({
          type: "error",
          errorMessage:
            "Something went wrong fetching employee list please try again later..."
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
                "Something went wrong fetching pay periods list please try again later..."
            });
      } catch (error) {
        console.error(error);
        dispatch({
          type: "error",
          errorMessage:
            "Something went wrong fetching pay periods list please try again later..."
        });
      }
    };

    getEmployees();
    getPayPeriods();
  }, []);

  const classes = useStyles();
  const [state, dispatch] = useReducer(timeSheetReducer, initialState);

  const { selectedEmployee, period, hours, isLoading, error, success } = state;
  const handleOnBlur = payload =>
    !state[payload]
      ? dispatch({
          type: "validationErrors",
          errorMessage: `${payload} field is required.`,
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

  const handleSubmit = async e => {
    e.preventDefault();

    dispatch({ type: "submit" });

    const endpoit =
      "https://enoccmh976.execute-api.ca-central-1.amazonaws.com/default/hhpm";

    const body = JSON.stringify({
      selectedEmployee,
      period,
      hours
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
            {/* TODO: add styling of error and success messages show to client --> */}
            {error && <p className="error">{error}</p>}
            {success && (
              <p className="success">Thank you, info submitted successfully!</p>
            )}
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
              {/* TODO: remove hardcoded employee dummy data and fetch actual data from DB */}
              {state.employees.map(employee => (
                <MenuItem key={employee.id} value={employee.name}>
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
              {/* TODO: remove hardcoded payperiods dummy data and fetch actual data from DB */}
              {state.payperiods.map(period => (
                <MenuItem key={period.periodNum} value={period.periodNum}>
                  {new Date(period.periodStart).toDateString()} to{" "}
                  {new Date(period.periodEnd).toDateString()}
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
    </Container>
  );
};

export default EmployeeForm;
