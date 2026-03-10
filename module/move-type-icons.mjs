import { MOVE_TYPE_KEYS, getSystemAssetPath } from "./constants.mjs";

const TYPE_ICON_ROOT = getSystemAssetPath("assets/types");
const TYPE_ICON_EXT = ".svg";
const FALLBACK_TYPE = "none";

export const MOVE_TYPE_ICON_BY_KEY = Object.freeze(
  Object.fromEntries(
    [...MOVE_TYPE_KEYS, FALLBACK_TYPE].map((typeKey) => [
      typeKey,
      `${TYPE_ICON_ROOT}/${typeKey}${TYPE_ICON_EXT}`
    ])
  )
);

export function getMoveTypeIcon(typeKey) {
  const normalizedType = `${typeKey ?? FALLBACK_TYPE}`.toLowerCase();
  return MOVE_TYPE_ICON_BY_KEY[normalizedType] ?? MOVE_TYPE_ICON_BY_KEY[FALLBACK_TYPE];
}
