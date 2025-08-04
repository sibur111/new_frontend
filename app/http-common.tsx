import axios from "axios";

export default axios.create({
        baseURL: "https://sibur-soakulo.amvera.io",
        headers: {
            "Content-type": "application/json",
        }
    }
);