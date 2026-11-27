import { expect, test } from "@playwright/test";
import { getMembersRedirect } from "../../lib/auth/signup-routing";
import { readAllDirectoryMembers } from "../../lib/members/directory-query";
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

function cappedProfiles(total: number, cap: number) {
  const rows = Array.from({ length: total }, (_, i) => ({ user_id: `${i}`, first_name: `First${i}`, last_name: `Last${i}` }));
  const ranges: Array<[number, number]> = [];
  const query = {
    order: () => query,
    range(from: number, to: number) {
      ranges.push([from, to]);
      return Promise.resolve({ data: rows.slice(from, Math.min(to + 1, from + cap)), error: null, count: rows.length });
    },
  };
  return { ranges, client: { from: () => ({ select: () => query }) } as never };
}

test("directory reads every profile even when each response is capped", async () => {
  const capped = cappedProfiles(5, 2);
  const result = await readAllDirectoryMembers(capped.client);
  expect(result.map(m => m.id)).toEqual(["0", "1", "2", "3", "4"]);
  expect(capped.ranges).toEqual([[0, 999], [2, 1001], [4, 1003]]);

  const small = cappedProfiles(3, 1000);
  expect(await readAllDirectoryMembers(small.client)).toHaveLength(3);
  expect(small.ranges).toEqual([[0, 999]]);
});

test("initials use the first character of each name", () => {
  expect(initials(members[0])).toBe("LT");
  expect(initials({ id: "4", firstName: "😀ada", lastName: "lovelace" })).toBe("😀L");
});
