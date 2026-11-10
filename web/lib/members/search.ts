export type DirectoryMember = { id: string; firstName: string; lastName: string };

function fold(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
}

export function filterMembers(members: DirectoryMember[], query: string): DirectoryMember[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return members;
  return members.filter(member => {
    const name = fold(`${member.firstName} ${member.lastName}`);
    return terms.every(term => name.includes(term));
  });
}

export function initials(member: DirectoryMember): string {
  return [member.firstName, member.lastName].map(name => Array.from(name)[0] ?? "").join("").toLocaleUpperCase();
}
