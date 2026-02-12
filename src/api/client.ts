import axios from "axios";
import { toast } from "sonner";

const SPRING_API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export const springApi = axios.create({
  baseURL: SPRING_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

springApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;
      const message = data?.message || "알 수 없는 에러가 발생했습니다.";
      toast.error("요청 실패", { description: message });
    } else if (axios.isAxiosError(error) && error.request) {
      toast.error("네트워크 오류", { description: "서버에 연결할 수 없습니다." });
    } else {
      toast.error("오류 발생", { description: "예기치 않은 오류가 발생했습니다." });
    }
    return Promise.reject(error);
  },
);

const FASTAPI_BASE_URL = import.meta.env.VITE_SERVER_URL;

export const fastApi = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

fastApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;
      const message = data?.detail || data?.message || "알 수 없는 에러가 발생했습니다.";
      toast.error("요청 실패", { description: message });
    } else if (axios.isAxiosError(error) && error.request) {
      toast.error("네트워크 오류", { description: "서버에 연결할 수 없습니다." });
    } else {
      toast.error("오류 발생", { description: "예기치 않은 오류가 발생했습니다." });
    }
    return Promise.reject(error);
  },
);
