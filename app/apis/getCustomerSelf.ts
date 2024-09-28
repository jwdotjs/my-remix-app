import { ApiRequestOptions, networkRequest } from "./utils/networkRequest";

export function getCustomerSelf(options: ApiRequestOptions) {
  return networkRequest({
    ...options,
    pathname: "/api/v2/customers/self",
  });
}
