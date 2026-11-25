// UBC Vancouver faculties and schools used by the event registration dropdown.
//
// Source (reviewed 2026-11-08):
// - https://www.ubc.ca/our-campuses/vancouver/directories/faculties-schools.html
//
// This is a repository-owned baseline. Update it from the source instead of
// fetching at runtime.

export type UbcVancouverFaculty = {
  value: string;
  label: string;
};

export const ubcVancouverFaculties: ReadonlyArray<UbcVancouverFaculty> = [
  { value: "applied-science", label: "Faculty of Applied Science" },
  { value: "arts", label: "Faculty of Arts" },
  { value: "dentistry", label: "Faculty of Dentistry" },
  { value: "education", label: "Faculty of Education" },
  {
    value: "forestry-and-environmental-stewardship",
    label: "Faculty of Forestry and Environmental Stewardship",
  },
  { value: "land-and-food-systems", label: "Faculty of Land and Food Systems" },
  { value: "medicine", label: "Faculty of Medicine" },
  { value: "pharmaceutical-sciences", label: "Faculty of Pharmaceutical Sciences" },
  { value: "science", label: "Faculty of Science" },
  { value: "law", label: "Peter A. Allard School of Law" },
  { value: "commerce-and-business-administration", label: "Sauder School of Business" },
  { value: "kinesiology", label: "School of Kinesiology" },
  { value: "music", label: "School of Music" },
  { value: "nursing", label: "School of Nursing" },
  { value: "social-work", label: "School of Social Work" },
  { value: "economics", label: "Vancouver School of Economics" },
];
