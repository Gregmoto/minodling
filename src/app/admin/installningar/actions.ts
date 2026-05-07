"use server";

import { updateSettingsBulk } from "@/app/admin/actions";
import { SETTINGS } from "@/lib/settings";

const ok = { ok: true } as const;

export async function saveAnalytics(_: unknown, fd: FormData) {
  await updateSettingsBulk({
    [SETTINGS.GA_ID]:               fd.get(SETTINGS.GA_ID)               as string,
    [SETTINGS.GA_SCRIPT]:           fd.get(SETTINGS.GA_SCRIPT)           as string,
    [SETTINGS.GOOGLE_VERIFICATION]: fd.get(SETTINGS.GOOGLE_VERIFICATION) as string,
    [SETTINGS.BING_VERIFICATION]:   fd.get(SETTINGS.BING_VERIFICATION)   as string,
  });
  return ok;
}

export async function saveSeo(_: unknown, fd: FormData) {
  await updateSettingsBulk({
    [SETTINGS.SEO_TITLE]:       fd.get(SETTINGS.SEO_TITLE)       as string,
    [SETTINGS.SEO_DESCRIPTION]: fd.get(SETTINGS.SEO_DESCRIPTION) as string,
    [SETTINGS.SEO_OG_IMAGE]:    fd.get(SETTINGS.SEO_OG_IMAGE)    as string,
    [SETTINGS.SEO_ROBOTS]:      fd.get(SETTINGS.SEO_ROBOTS)      as string,
    [SETTINGS.SEO_SITEMAP]:     fd.get(SETTINGS.SEO_SITEMAP)     as string ?? "",
    [SETTINGS.SEO_CANONICAL]:   fd.get(SETTINGS.SEO_CANONICAL)   as string,
  });
  return ok;
}

export async function saveSite(_: unknown, fd: FormData) {
  await updateSettingsBulk({
    [SETTINGS.SITE_NAME]:        fd.get(SETTINGS.SITE_NAME)        as string,
    [SETTINGS.SITE_FOOTER]:      fd.get(SETTINGS.SITE_FOOTER)      as string,
    [SETTINGS.SITE_EMAIL]:       fd.get(SETTINGS.SITE_EMAIL)       as string,
    [SETTINGS.SITE_INSTAGRAM]:   fd.get(SETTINGS.SITE_INSTAGRAM)   as string,
    [SETTINGS.SITE_FACEBOOK]:    fd.get(SETTINGS.SITE_FACEBOOK)    as string,
    [SETTINGS.SITE_TWITTER]:     fd.get(SETTINGS.SITE_TWITTER)     as string,
    [SETTINGS.SITE_COOKIE_TEXT]: fd.get(SETTINGS.SITE_COOKIE_TEXT) as string,
  });
  return ok;
}

export async function saveHomepage(_: unknown, fd: FormData) {
  await updateSettingsBulk({
    [SETTINGS.HERO_STATS_VISIBLE]: fd.has(SETTINGS.HERO_STATS_VISIBLE) ? "true" : "false",
  });
  return ok;
}

export async function saveAiKeys(_: unknown, fd: FormData) {
  await updateSettingsBulk({
    plant_id_api_key: fd.get("plant_id_api_key") as string,
    plantnet_api_key: fd.get("plantnet_api_key") as string,
  });
  return ok;
}
