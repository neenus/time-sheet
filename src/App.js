import "./App.css";
import EmployeeForm from "./components/form/employee-form.component";
import Footer from "./components/footer/footer.component";
import { Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  title: {
    marginTop: theme.spacing(1.25),
    textTransform: "uppercase"
  }
}));

function App() {
  const classes = useStyles();
  return (
    <div className="App">
      <Typography component="h1" variant="h4" className={classes.title}>
        Time Sheet
      </Typography>
      <EmployeeForm />
      <Footer />
    </div>
  );
}

export default App;
