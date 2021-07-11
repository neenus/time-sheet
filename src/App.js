import "./App.css";
import EmployeeForm from "./components/form/employee-form.component";
import Footer from "./components/footer/footer.component";
import { Typography, makeStyles } from "@material-ui/core";
import { useEffect } from "react";

// Inject mouse flow script dynamically when in production mode
const loadMouseFolow = () => {
  if (process.env.NODE_ENV === "production") {
    window._mfq = window._mfq || [];
    (function () {
      var mf = document.createElement("script");
      mf.type = "text/javascript";
      mf.defer = true;
      mf.src =
        "//cdn.mouseflow.com/projects/09464c8e-535b-49fd-9713-a76db72cb0b1.js";
      document.getElementsByTagName("head")[0].appendChild(mf);
    })();
  }
};

const useStyles = makeStyles(theme => ({
  title: {
    marginTop: theme.spacing(1.25),
    textTransform: "uppercase"
  }
}));

function App() {
  useEffect(() => {
    loadMouseFolow();
  });
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
