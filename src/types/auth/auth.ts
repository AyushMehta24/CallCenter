export interface ILoginForm {
  email: string;
  password: string;
  isRememberMe: boolean;
}

export interface IForgetPassword {
  email: string | undefined;
}

export interface IResetPassword {
  rePassword: string;
  cPassword: string;
}
export interface DateTimeUtcUnixEpoch {
  dateTimeUTC: string;
  unixEpoch: number;
}
export interface RefreshToken {
  token: string;
  tokenId: number;
  expires: DateTimeUtcUnixEpoch;
}

export interface AccessToken {
  jwt: string;
}

export interface ModulePermissions {
  [moduleName: string]: string[];
}

export interface roleDataType {
  finalArray: ModulePermissions[]
}