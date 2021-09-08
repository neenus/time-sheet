import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary">
      {"Copyright © "}
      <Link color="inherit" href="https://nraccounting.ca/">
        wwww.nraccounting.ca
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    paddingBottom: theme.spacing(15)
  },
  footer: {
    width: "100%",
    padding: theme.spacing(3, 2),
    marginTop: theme.spacing(5),
    position: "absolute",
    bottom: 0
  }
}));

export default function StickyFooter() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <footer className={classes.footer}>
        <Container maxWidth="sm">
          <Typography variant="body1">
            NR Accounting & Business Advisors Inc.
          </Typography>
          <Copyright />
        </Container>
      </footer>
    </div>
  );
}
