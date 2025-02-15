import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { dismissedBannersSelector } from "~/renderer/reducers/settings";
import { dismissBanner } from "~/renderer/actions/settings";
import { radii } from "~/renderer/styles/theme";
import IconCross from "~/renderer/icons/Cross";
import Box from "~/renderer/components/Box";
import { Link } from "@ledgerhq/react-ui";
import theme from "@ledgerhq/react-ui/styles/theme";
import { openURL } from "../linking";

const IconContainer = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

const Container = styled(Box).attrs<{
  status: string;
}>(p => ({
  horizontal: true,
  alignItems: "center",
  py: "8px",
  px: 3,
  bg: p.theme.colors[p.status] || "palette.primary.main",
  color: "palette.primary.contrastText",
  mb: 20,
  fontSize: 4,
  ff: "Inter|SemiBold",
}))<{
  status: string;
}>`
  border-radius: ${radii[1]}px;
`;

const RightContainer = styled.div`
  margin-left: auto;
`;

export const FakeLink = styled.span<{
  disabled?: boolean;
}>`
  color: ${p => p.theme.colors.palette.primary.contrastText};
  text-decoration: underline;
  cursor: pointer;
  pointer-events: ${p => (p.disabled ? "none" : "auto")};
  opacity: ${p => (p.disabled ? "0.6" : "1")};
`;

const CloseContainer = styled(Box).attrs(() => ({
  color: "palette.primary.contrastText",
}))`
  z-index: 1;
  margin-left: 10px;
  cursor: pointer;
  &:hover {
    color: #eee;
  }

  &:active {
    color: #eee;
  }
`;

const LinkContainer = styled.div`
  align-self: flex-end;
`;

export type Content = {
  Icon?: React.ComponentType<{ size: number }>;
  message: React.ReactNode;
  right?: React.ReactNode;
};

type Props = {
  content?: Content;
  status?: string;
  dismissable?: boolean;
  link?: {
    text: string;
    href: string;
  };
  bannerId?: string;
  id?: string;
  testId?: string;
};

const TopBanner = ({
  id,
  testId,
  content,
  status = "",
  dismissable = false,
  bannerId,
  link,
}: Props) => {
  const dispatch = useDispatch();
  const dismissedBanners = useSelector(dismissedBannersSelector);
  const onDismiss = useCallback(() => {
    if (bannerId) {
      dispatch(dismissBanner(bannerId));
    }
  }, [bannerId, dispatch]);

  if (!content || (bannerId && dismissedBanners.includes(bannerId))) return null;

  const { Icon, message, right } = content;

  return (
    <Container status={status} id={id} data-testid={testId}>
      {Icon && (
        <IconContainer>
          <Icon size={18} />
        </IconContainer>
      )}
      {message}
      {right && <RightContainer>{right}</RightContainer>}
      {link && (
        <LinkContainer>
          <Link
            style={{ color: theme.colors.neutral.c100 }}
            alwaysUnderline
            onClick={() => openURL(link.href)}
          >
            {link.text}
          </Link>
        </LinkContainer>
      )}
      {dismissable && (
        <CloseContainer id={`dismiss-${bannerId || ""}-banner`} onClick={onDismiss}>
          <IconCross size={14} />
        </CloseContainer>
      )}
    </Container>
  );
};

export default TopBanner;
