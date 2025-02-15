import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { getEnv } from "@ledgerhq/live-env";
import { latestFirmwareSelector } from "~/renderer/reducers/settings";
import TopBanner, { FakeLink } from "~/renderer/components/TopBanner";
import getCleanVersion from "~/renderer/screens/manager/FirmwareUpdate/getCleanVersion";
import { UpdaterContext } from "~/renderer/components/Updater/UpdaterContext";
import { VISIBLE_STATUS } from "./Updater/Banner";
import { IconsLegacy, Text } from "@ledgerhq/react-ui";
const FirmwareUpdateBanner = ({ old, right }: { old?: boolean; right?: React.ReactNode }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const location = useLocation();
  const latestFirmware = useSelector(latestFirmwareSelector);
  const visibleFirmwareVersion =
    process.env.DEBUG_FW_VERSION ??
    (latestFirmware ? getCleanVersion(latestFirmware.final.name) : "");

  // The 2.1.0-rc2 release caused issues with localization e2e tests because it
  // displayed a banner for updating the FW, which would continue to show with
  // future releases. To fix this, the banner is currently being manually removed.
  // A more stable solution would be to mock all API calls.
  const hideBannerForMocks = getEnv("MOCK") && visibleFirmwareVersion.startsWith("2.1");

  const onClick = () => {
    const urlParams = new URLSearchParams({
      firmwareUpdate: "true",
    });
    const search = urlParams.toString();
    history.push({
      pathname: "/manager",
      search: `?${search}`,
    });
  };
  const inManager = location.pathname === "/manager";
  if (!visibleFirmwareVersion || (!right && inManager) || hideBannerForMocks) return null;
  // prevents the standard banner in Default.js from being displayed in the manager

  return (
    <TopBanner
      id={"fw-update-banner"}
      content={{
        Icon: IconsLegacy.NanoFoldedMedium,
        message: (
          <Text color="neutral.c00">
            {t(old ? "manager.firmware.banner.old.warning" : "manager.firmware.banner.warning", {
              latestFirmware: visibleFirmwareVersion,
            })}
          </Text>
        ),
        right: right || <FakeLink onClick={onClick}>{t("manager.firmware.banner.cta")}</FakeLink>,
      }}
      status={"warning"}
    />
  );
};
const FirmwareUpdateBannerEntry = ({ old, right }: { old?: boolean; right?: React.ReactNode }) => {
  const context = useContext(UpdaterContext);
  if (context && context.version) {
    const { status } = context;
    if (VISIBLE_STATUS.includes(status)) return null;
  }
  return <FirmwareUpdateBanner old={old} right={right} />;
};
export default FirmwareUpdateBannerEntry;
