import { useParams } from "react-router-dom";
import StudentsPage from "./StudentsPage.jsx";
import { findClassLabel } from "../constants/classes.js";

// Renders one class/section's own student list + its own "Add New Student" flow.
// Route: /students/class/:className  (e.g. /students/class/9th, /students/class/Computer)
export default function ClassStudents() {
  const { className } = useParams();
  const label = findClassLabel(className);

  return (
    <StudentsPage
      lockedClass={className}
      title={`${label} Students`}
      subtitle={`Admissions, records and fees for ${label} only.`}
    />
  );
}
