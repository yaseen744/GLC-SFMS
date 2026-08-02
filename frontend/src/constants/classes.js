// Central list of class/section options.
// slug -> exact value stored in Student.class in the database
// label -> what shows in the sidebar / dropdowns
export const CLASS_LIST = [
  { slug: "7th", label: "Class 7th" },
  { slug: "8th", label: "Class 8th" },
  { slug: "9th", label: "Class 9th" },
  { slug: "10th", label: "Class 10th" },
  { slug: "11th", label: "Class 11th" },
  { slug: "12th", label: "Class 12th" },
  { slug: "Computer", label: "Computer" },
  { slug: "Tuition", label: "Tuition" },
];

export function findClassLabel(slug) {
  const found = CLASS_LIST.find((c) => c.slug === slug);
  return found ? found.label : slug;
}
