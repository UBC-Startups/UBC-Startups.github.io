import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { bp, color, figma, type } from "../theme";
import { links, navLinks } from "../content";

const socials = [
  { label: "LinkedIn", href: links.linkedin, icon: figma("icon-linkedin.svg"), size: 20 },
  { label: "Instagram", href: links.instagram, icon: figma("icon-instagram.svg"), size: 20 },
  { label: "Email", href: links.email, icon: figma("icon-email.svg"), size: 28 },
];

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: ${color.canvas};
`;
const Bar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px 16px 24px;
`;
const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${color.ink};
  text-decoration: none;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  img { display: block; width: 34px; height: 34px; }
`;
const Links = styled.ul`
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: clamp(32px, 5vw, 72px);
  ${bp.lg} { display: flex; }
  a {
    color: ${color.ink};
    text-decoration: none;
    font-size: 20px;
    font-weight: 500;
    line-height: 1.2;
  }
  a:hover { color: ${color.accent}; }
  a[aria-current="page"] { font-weight: 600; }
`;
const Socials = styled.div`
  display: none;
  align-items: center;
  gap: 16px;
  ${bp.lg} { display: flex; }
`;
const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  &:hover { background: ${color.muted}; }
  img { display: block; }
`;
const MenuButton = styled.button`
  ${type.labelM};
  border: 0;
  background: transparent;
  color: ${color.ink};
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  &:hover { background: ${color.muted}; }
  ${bp.lg} { display: none; }
`;
const MobileMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 24px 24px;
  ${bp.lg} { display: none; }
  a { color: ${color.ink}; text-decoration: none; font-size: 20px; font-weight: 500; padding: 8px 0; }
  a[aria-current="page"] { font-weight: 600; }
`;

function NavItem({ item, active, onClick }) {
  const current = active === item.label ? "page" : undefined;
  return item.hash ? (
    <HashLink smooth to={item.hash} onClick={onClick} aria-current={current}>{item.label}</HashLink>
  ) : (
    <Link to={item.to} aria-current={current} onClick={() => { window.scrollTo(0, 0); onClick && onClick(); }}>
      {item.label}
    </Link>
  );
}

function SocialIcons() {
  return socials.map((s) => (
    <SocialLink key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
      <img src={s.icon} alt="" width={s.size} height={s.size} />
    </SocialLink>
  ));
}

/** `active` is the label of the current page ("Events", "Team"), shown in semibold. */
export default function Nav({ active }) {
  const [open, setOpen] = useState(false);
  return (
    <Header>
      <Bar aria-label="Main">
        <Brand to="/" onClick={() => window.scrollTo(0, 0)}>
          <img src={figma("logo-mark.svg")} alt="" />
          UBC Startups
        </Brand>
        <Links>
          {navLinks.map((item) => (
            <li key={item.label}><NavItem item={item} active={active} /></li>
          ))}
        </Links>
        <Socials><SocialIcons /></Socials>
        <MenuButton aria-expanded={open} aria-controls="home-mobile-menu" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </MenuButton>
      </Bar>
      {open && (
        <MobileMenu id="home-mobile-menu">
          {navLinks.map((item) => (
            <NavItem key={item.label} item={item} active={active} onClick={() => setOpen(false)} />
          ))}
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}><SocialIcons /></div>
        </MobileMenu>
      )}
    </Header>
  );
}
