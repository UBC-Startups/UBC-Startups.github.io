import { expect, test } from "@playwright/test";
import { getMembersRedirect } from "../../lib/auth/signup-routing";
import { filterMembers, initials } from "../../lib/members/search";

const members = [
  { id: "1", firstName: "Léa", lastName: "Tremblay" },
  { id: "2", firstName: "Maya", lastName: "Chen" },
  { id: "3", firstName: "Arjun", lastName: "Mehta" },
];

test("signed-out visitors are sent to sign-in and return to /members", () => {
  expect(getMembersRedirect(null)).toBe("/sign-in?next=%2Fmembers");
});

test("members without a profile finish setup before the directory", () => {
  expect(getMembersRedirect({ profileComplete: false })).toBe("/profile/setup?next=%2Fmembers");
});

test("members with a profile can view the directory", () => {
  expect(getMembersRedirect({ profileComplete: true })).toBeNull();
});

test("search matches first, last, and full names ignoring case and accents", () => {
  expect(filterMembers(members, "")).toEqual(members);
  expect(filterMembers(members, "  ")).toEqual(members);
  expect(filterMembers(members, "lea").map(m => m.id)).toEqual(["1"]);
  expect(filterMembers(members, "CHEN").map(m => m.id)).toEqual(["2"]);
  expect(filterMembers(members, "maya chen").map(m => m.id)).toEqual(["2"]);
  expect(filterMembers(members, "maya mehta")).toEqual([]);
});

test("initials use the first character of each name", () => {
  expect(initials(members[0])).toBe("LT");
  expect(initials({ id: "4", firstName: "😀ada", lastName: "lovelace" })).toBe("😀L");
});
