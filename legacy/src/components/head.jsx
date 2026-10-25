import React from "react";
import { Helmet } from "react-helmet";

const Head = ({title}) => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>{title}</title>
            <link rel="icon" type="image" href="../images/Logo.svg" />
            
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
        </Helmet>
    )}

export default Head;