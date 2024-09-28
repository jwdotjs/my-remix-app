import { ApiRequestOptions, networkRequest } from "./utils/networkRequest";

export function getTagGroup(options: ApiRequestOptions, tagGroup: number) {
  return networkRequest({
    ...options,
    pathname: `/api/get_tag_group/?tag_group_id=${tagGroup}`,
    cache: true,
  });
}
