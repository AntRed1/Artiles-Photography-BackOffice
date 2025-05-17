import { environment as devEnv } from "./environment.development";
import { environment as prodEnv } from "./environment.production";

const environment = import.meta.env.MODE === "production" ? prodEnv : devEnv;

export default environment;
