import React from "react";

import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));

const LoadingScreen = () => {
    const classes = useStyles();
    let loadingTextOptions = ["eat. sleep. plan. repeat.", "time to hatch a plan.", "built with ❤️ by Will Mundy, Jamie Tan, David Torres-Ramos, Manan Bajaj, Max Bowman, Peter Wang, and Skylar Neuendorff"]
    let selectedQuoteIdx = Math.floor(Math.random() * 3)
    let loadingText = loadingTextOptions[selectedQuoteIdx];
    return (
        <Backdrop className={classes.backdrop} open={true}>
            <div style={{ display: "block", justifyContent: 'center' }}>
                <div style={{ width: "25%", margin: '0 auto' }}>
                    <CircularProgress color="inherit" />
                </div>
                <h4>{loadingText}</h4>
            </div>
        </Backdrop>
    )
}

export default LoadingScreen;