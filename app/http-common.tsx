import axios from "axios";

export default axios.create({
        baseURL: "https://sibur-selection-ghataju.amvera.io",
        headers: {
            "Content-type": "application/json",
        }
    }
);