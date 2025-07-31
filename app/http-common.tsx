import axios from "axios";

export default axios.create({
        baseURL: "https://sibur-selection-ghataju.amvera.io/api",
        headers: {
            "Content-type": "application/json",
        }
    }
);