import { ApiRequestOptions, networkRequest } from "./utils/networkRequest";

export function getCustomerEntity(
  options: ApiRequestOptions,
  customerId: number,
  entity: string
) {
  return networkRequest({
    ...options,
    pathname: `/api/v2/customers/${customerId}/${entity}/`,
  });
}
