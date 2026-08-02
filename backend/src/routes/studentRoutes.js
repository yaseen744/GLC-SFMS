import express from "express";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", listStudents);
router.post("/", createStudent);
router.get("/:id", getStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
