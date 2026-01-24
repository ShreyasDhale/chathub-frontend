import { apiRequest } from "./httpClient";
import { LoginRequestDto, LoginResponseDto, SignupRequestDto } from "../../types/auth.types";
import { DynamicApiResponse } from "../../types/api.types"; 

export function login(data: LoginRequestDto) {
  return apiRequest<DynamicApiResponse<LoginResponseDto,null>>("/Users/Login", {
    method: "POST",
    body: data,
  });
}

export function logout() {
  return apiRequest<DynamicApiResponse<LoginResponseDto,null>>("/Users/Logout", {
    method: "POST",
  });
}

export function signup(data: SignupRequestDto) {
  return apiRequest<DynamicApiResponse<null,null>>("/Users/signup", {
    method: "POST",
    body: data,
  });
}
