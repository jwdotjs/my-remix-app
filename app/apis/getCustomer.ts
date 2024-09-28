import { Headers, networkRequest } from "./utils/networkRequest";

export function getCustomer(options: Headers) {
  return networkRequest({
    ...options,
    pathname: `/api/get_customer/`,
  });
}
