const apiURL = import.meta.env.VITE_API_URL
const wsURL = import.meta.env.VITE_WS_API_URL
if (!apiURL) {
  throw Error("VITE_API_URL not provided")
} else if (!wsURL) {
  throw Error("VITE_WS_API_URL not provided")
}
export const API_URL = apiURL
export const WS_URL = wsURL
