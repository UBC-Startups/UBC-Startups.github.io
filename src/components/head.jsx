import { Helmet } from "react-helmet";

const Head = ({title}) => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>{title}</title>
            <link rel="icon" type="image" href="../images/logo.png" />
            
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Helmet>
    )}

export default Head;