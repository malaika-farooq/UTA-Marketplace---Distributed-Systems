let baseURL = "";

export const setArchitecture = (mode: "micro" | "mono") => {
  baseURL =
    mode === "micro"
      ? "http://localhost:8080/api"
      : "http://localhost:9000/api";
};

export const getBaseURL = () => baseURL;