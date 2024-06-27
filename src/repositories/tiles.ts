import axios from "axios";
import environment from "../environment";

export const tilesApi = axios.create({
  baseURL: environment.API_TILES_URL,
});
